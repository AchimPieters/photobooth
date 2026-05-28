import UIKit
import AVFoundation

final class CameraViewController: UIViewController {

    weak var coordinator: AppCoordinator?
    var session: PhotoboothSession!

    // MARK: - Services
    private let camera = CameraService()

    // MARK: - UI
    private let previewLayer  = AVCaptureVideoPreviewLayer()
    private let flashView     = UIView()
    private let topBar        = UIView()
    private let closeButton   = UIButton(type: .system)
    private let progressLabel = UILabel()
    private let thumbnailStack = UIStackView()
    private let shutterButton = UIButton(type: .custom)
    private let hintLabel     = UILabel()
    private let countdownLabel = UILabel()
    private var thumbnailViews: [UIImageView] = []

    // MARK: - State
    private var isTakingPhoto = false
    private var countdown = 0
    private var countdownTimer: Timer?

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        setupPreviewLayer()
        setupFlash()
        setupTopBar()
        setupThumbnails()
        setupBottomControls()
        setupCountdownLabel()

        camera.requestAccessAndSetup { [weak self] granted in
            guard let self = self else { return }
            if !granted { self.showNoCameraPermission() }
        }
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        updateUI()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        countdownTimer?.invalidate()
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        camera.stop()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer.frame = view.bounds
    }

    override var prefersStatusBarHidden: Bool { true }

    // MARK: - Setup

    private func setupPreviewLayer() {
        previewLayer.session     = camera.session
        previewLayer.videoGravity = .resizeAspectFill
        view.layer.addSublayer(previewLayer)
    }

    private func setupFlash() {
        flashView.backgroundColor = .white
        flashView.alpha = 0
        flashView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(flashView)
        NSLayoutConstraint.activate([
            flashView.topAnchor.constraint(equalTo: view.topAnchor),
            flashView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            flashView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            flashView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])
        flashView.isUserInteractionEnabled = false
    }

    private func setupTopBar() {
        topBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(topBar)

        closeButton.setImage(UIImage(named: "xmark") ?? closeXImage(), for: .normal)
        closeButton.tintColor       = .white
        closeButton.backgroundColor = UIColor.black.withAlphaComponent(0.4)
        closeButton.layer.cornerRadius = 22
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        closeButton.addTarget(self, action: #selector(closeTapped), for: .touchUpInside)

        progressLabel.textColor     = .white
        progressLabel.font          = .systemFont(ofSize: 17, weight: .semibold)
        progressLabel.textAlignment = .center
        progressLabel.backgroundColor = UIColor.black.withAlphaComponent(0.4)
        progressLabel.layer.cornerRadius = 14
        progressLabel.clipsToBounds = true
        progressLabel.translatesAutoresizingMaskIntoConstraints = false

        topBar.addSubview(closeButton)
        topBar.addSubview(progressLabel)

        NSLayoutConstraint.activate([
            topBar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            topBar.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            topBar.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            topBar.heightAnchor.constraint(equalToConstant: 44),

            closeButton.leadingAnchor.constraint(equalTo: topBar.leadingAnchor),
            closeButton.centerYAnchor.constraint(equalTo: topBar.centerYAnchor),
            closeButton.widthAnchor.constraint(equalToConstant: 44),
            closeButton.heightAnchor.constraint(equalToConstant: 44),

            progressLabel.centerXAnchor.constraint(equalTo: topBar.centerXAnchor),
            progressLabel.centerYAnchor.constraint(equalTo: topBar.centerYAnchor),
            progressLabel.heightAnchor.constraint(equalToConstant: 32),
            progressLabel.widthAnchor.constraint(greaterThanOrEqualToConstant: 140),
        ])
    }

    private func setupThumbnails() {
        thumbnailStack.axis         = .horizontal
        thumbnailStack.spacing      = 10
        thumbnailStack.alignment    = .center
        thumbnailStack.distribution = .equalSpacing
        thumbnailStack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(thumbnailStack)

        for i in 0..<AppConfig.totalPhotos {
            let iv = UIImageView()
            iv.contentMode       = .scaleAspectFill
            iv.clipsToBounds     = true
            iv.layer.cornerRadius = 8
            iv.backgroundColor   = .clear
            iv.layer.borderWidth = 1
            iv.layer.borderColor = UIColor.white.withAlphaComponent(0.3).cgColor
            iv.translatesAutoresizingMaskIntoConstraints = false
            iv.widthAnchor.constraint(equalToConstant: 90).isActive  = true
            iv.heightAnchor.constraint(equalToConstant: 68).isActive = true
            iv.tag = i
            thumbnailStack.addArrangedSubview(iv)
            thumbnailViews.append(iv)
        }

        NSLayoutConstraint.activate([
            thumbnailStack.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            thumbnailStack.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -140),
        ])
    }

    private func setupBottomControls() {
        // Sluiterknop
        shutterButton.backgroundColor   = .white
        shutterButton.layer.cornerRadius = 45
        shutterButton.translatesAutoresizingMaskIntoConstraints = false
        shutterButton.addTarget(self, action: #selector(shutterTapped), for: .touchUpInside)

        let ring = UIView()
        ring.layer.borderColor  = UIColor.white.withAlphaComponent(0.5).cgColor
        ring.layer.borderWidth  = 4
        ring.layer.cornerRadius = 52
        ring.translatesAutoresizingMaskIntoConstraints = false
        ring.isUserInteractionEnabled = false

        view.addSubview(ring)
        view.addSubview(shutterButton)

        hintLabel.text          = "Tik om een foto te maken"
        hintLabel.font          = .systemFont(ofSize: 16, weight: .medium)
        hintLabel.textColor     = UIColor.white.withAlphaComponent(0.7)
        hintLabel.textAlignment = .center
        hintLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(hintLabel)

        NSLayoutConstraint.activate([
            shutterButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            shutterButton.bottomAnchor.constraint(equalTo: hintLabel.topAnchor, constant: -16),
            shutterButton.widthAnchor.constraint(equalToConstant: 90),
            shutterButton.heightAnchor.constraint(equalToConstant: 90),

            ring.centerXAnchor.constraint(equalTo: shutterButton.centerXAnchor),
            ring.centerYAnchor.constraint(equalTo: shutterButton.centerYAnchor),
            ring.widthAnchor.constraint(equalToConstant: 104),
            ring.heightAnchor.constraint(equalToConstant: 104),

            hintLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            hintLabel.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -30),
        ])
    }

    private func setupCountdownLabel() {
        countdownLabel.font          = .systemFont(ofSize: 220, weight: .black)
        countdownLabel.textColor     = .white
        countdownLabel.textAlignment = .center
        countdownLabel.alpha         = 0
        countdownLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(countdownLabel)
        NSLayoutConstraint.activate([
            countdownLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            countdownLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor),
        ])
    }

    // MARK: - UI Update

    private func updateUI() {
        let taken = session.photos.count
        let total = AppConfig.totalPhotos
        progressLabel.text = "  Foto \(min(taken + 1, total)) van \(total)  "

        for (i, iv) in thumbnailViews.enumerated() {
            if i < taken {
                iv.image         = session.photos[i]
                iv.layer.borderWidth = 0
            } else {
                iv.image         = nil
                iv.layer.borderWidth = i == taken ? 2 : 1
                iv.layer.borderColor = (i == taken
                    ? UIColor.white
                    : UIColor.white.withAlphaComponent(0.3)).cgColor
            }
        }
    }

    // MARK: - Countdown & capture

    @objc private func shutterTapped() {
        guard !isTakingPhoto else { return }
        isTakingPhoto = true
        HapticFeedback.impact(.medium)
        shutterButton.isEnabled = false
        hintLabel.text = "Lach!"
        startCountdown()
    }

    private func startCountdown() {
        countdown = AppConfig.countdownSecs
        showCountdown(countdown)
        countdownTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] timer in
            guard let self = self else { timer.invalidate(); return }
            self.countdown -= 1
            if self.countdown > 0 {
                self.showCountdown(self.countdown)
            } else {
                timer.invalidate()
                self.showCountdown(nil)
                self.triggerCapture()
            }
        }
    }

    private func showCountdown(_ value: Int?) {
        if let value = value {
            countdownLabel.text  = "\(value)"
            countdownLabel.alpha = 1
        } else {
            UIView.animate(withDuration: 0.2) { self.countdownLabel.alpha = 0 }
        }
    }

    private func triggerCapture() {
        // Flash
        UIView.animate(withDuration: 0.15, animations: {
            self.flashView.alpha = 1
        }, completion: { _ in
            UIView.animate(withDuration: 0.15) { self.flashView.alpha = 0 }
        })

        HapticFeedback.notification(.success)

        camera.capturePhoto { [weak self] image in
            guard let self = self else { return }
            self.session.photos.append(image)
            self.updateUI()
            self.isTakingPhoto = false
            self.shutterButton.isEnabled = true
            self.hintLabel.text = "Tik om een foto te maken"

            if self.session.photos.count >= AppConfig.totalPhotos {
                // Kleine pauze, dan door naar preview
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                    self.coordinator?.showPreview(session: self.session)
                }
            }
        }
    }

    // MARK: - Geen camera

    private func showNoCameraPermission() {
        let label = UILabel()
        label.text          = "Camera toegang vereist\n\nGa naar Instellingen → Photobooth → Camera"
        label.numberOfLines = 0
        label.textColor     = UIColor.white.withAlphaComponent(0.7)
        label.font          = .systemFont(ofSize: 20)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 40),
            label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -40),
        ])
    }

    // MARK: - Acties

    @objc private func closeTapped() {
        countdownTimer?.invalidate()
        coordinator?.showWelcome()
    }

    // MARK: - Helpers

    private func closeXImage() -> UIImage {
        let size = CGSize(width: 24, height: 24)
        UIGraphicsBeginImageContextWithOptions(size, false, 0)
        UIColor.white.setStroke()
        let path = UIBezierPath()
        path.lineWidth = 2.5
        path.move(to: CGPoint(x: 4, y: 4))
        path.addLine(to: CGPoint(x: 20, y: 20))
        path.move(to: CGPoint(x: 20, y: 4))
        path.addLine(to: CGPoint(x: 4, y: 20))
        path.stroke()
        let img = UIGraphicsGetImageFromCurrentImageContext()!
        UIGraphicsEndImageContext()
        return img.withRenderingMode(.alwaysTemplate)
    }
}
