import UIKit

final class DoneViewController: UIViewController {

    weak var coordinator: AppCoordinator?
    var session: PhotoboothSession!

    // MARK: - UI
    private let gradientLayer  = CAGradientLayer()
    private let checkmarkLabel = UILabel()
    private let titleLabel     = UILabel()
    private let subtitleLabel  = UILabel()
    private let stripImageView = UIImageView()
    private let reprintButton  = UIButton(type: .system)
    private let newButton      = UIButton(type: .system)
    private let countdownLabel = UILabel()

    // MARK: - State
    private var autoRestartSeconds = AppConfig.autoRestartSec
    private var autoRestartTimer: Timer?

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupBackground()
        setupViews()
        setupConstraints()
        animateCheckmark()
        printStrip()
        startAutoRestart()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        autoRestartTimer?.invalidate()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        gradientLayer.frame = view.bounds
    }

    override var prefersStatusBarHidden: Bool { true }

    // MARK: - Setup

    private func setupBackground() {
        gradientLayer.colors = [UIColor(hex: "1a1a2e").cgColor, UIColor(hex: "0f3460").cgColor]
        gradientLayer.startPoint = CGPoint(x: 0, y: 0)
        gradientLayer.endPoint   = CGPoint(x: 1, y: 1)
        view.layer.insertSublayer(gradientLayer, at: 0)
    }

    private func setupViews() {
        checkmarkLabel.text          = "✓"
        checkmarkLabel.font          = .systemFont(ofSize: 100, weight: .bold)
        checkmarkLabel.textColor     = UIColor(hex: "27ae60")
        checkmarkLabel.textAlignment = .center
        checkmarkLabel.alpha         = 0
        checkmarkLabel.transform     = CGAffineTransform(scaleX: 0.5, y: 0.5)
        checkmarkLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(checkmarkLabel)

        titleLabel.text          = "Betaald!"
        titleLabel.font          = .systemFont(ofSize: 52, weight: .black)
        titleLabel.textColor     = .white
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(titleLabel)

        subtitleLabel.text          = "Je strip wordt nu geprint."
        subtitleLabel.font          = .systemFont(ofSize: 24, weight: .light)
        subtitleLabel.textColor     = UIColor.white.withAlphaComponent(0.7)
        subtitleLabel.textAlignment = .center
        subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(subtitleLabel)

        stripImageView.contentMode       = .scaleAspectFit
        stripImageView.layer.cornerRadius = 10
        stripImageView.clipsToBounds      = true
        stripImageView.image              = session.stripImage
        stripImageView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stripImageView)

        reprintButton.setTitle("🖨  Opnieuw printen", for: .normal)
        reprintButton.titleLabel?.font    = .systemFont(ofSize: 22, weight: .semibold)
        reprintButton.setTitleColor(.white, for: .normal)
        reprintButton.backgroundColor     = UIColor.white.withAlphaComponent(0.12)
        reprintButton.layer.cornerRadius  = 18
        reprintButton.contentEdgeInsets   = UIEdgeInsets(top: 22, left: 30, bottom: 22, right: 30)
        reprintButton.translatesAutoresizingMaskIntoConstraints = false
        reprintButton.addTarget(self, action: #selector(reprintTapped), for: .touchUpInside)
        view.addSubview(reprintButton)

        newButton.setTitle("↩  Nieuwe sessie starten  (15s)", for: .normal)
        newButton.titleLabel?.font    = .systemFont(ofSize: 22, weight: .semibold)
        newButton.setTitleColor(.white, for: .normal)
        newButton.backgroundColor     = UIColor(hex: "e94560")
        newButton.layer.cornerRadius  = 18
        newButton.contentEdgeInsets   = UIEdgeInsets(top: 22, left: 30, bottom: 22, right: 30)
        newButton.translatesAutoresizingMaskIntoConstraints = false
        newButton.addTarget(self, action: #selector(newSessionTapped), for: .touchUpInside)
        view.addSubview(newButton)
    }

    private func setupConstraints() {
        NSLayoutConstraint.activate([
            checkmarkLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 40),
            checkmarkLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            titleLabel.topAnchor.constraint(equalTo: checkmarkLabel.bottomAnchor, constant: 12),
            titleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            subtitleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            stripImageView.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 24),
            stripImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            stripImageView.heightAnchor.constraint(equalToConstant: 260),
            stripImageView.widthAnchor.constraint(lessThanOrEqualTo: view.widthAnchor, multiplier: 0.5),

            reprintButton.bottomAnchor.constraint(equalTo: newButton.topAnchor, constant: -16),
            reprintButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            reprintButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 50),
            reprintButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -50),

            newButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -40),
            newButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            newButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 50),
            newButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -50),
        ])
    }

    // MARK: - Animatie

    private func animateCheckmark() {
        UIView.animate(withDuration: 0.5,
                       delay: 0,
                       usingSpringWithDamping: 0.6,
                       initialSpringVelocity: 0.8,
                       options: [],
                       animations: {
            self.checkmarkLabel.alpha     = 1
            self.checkmarkLabel.transform = .identity
        })
        HapticFeedback.notification(.success)
    }

    // MARK: - Printen

    private func printStrip() {
        guard let strip = session.stripImage else { return }
        let printInfo = UIPrintInfo(dictionary: nil)
        printInfo.jobName    = "Fotostrip"
        printInfo.outputType = .photo
        let controller = UIPrintInteractionController.shared
        controller.printInfo    = printInfo
        controller.printingItem = strip
        controller.present(animated: true, completionHandler: nil)
    }

    // MARK: - Auto-restart

    private func startAutoRestart() {
        autoRestartSeconds = AppConfig.autoRestartSec
        autoRestartTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] timer in
            guard let self = self else { timer.invalidate(); return }
            self.autoRestartSeconds -= 1
            let title = "↩  Nieuwe sessie starten  (\(self.autoRestartSeconds)s)"
            self.newButton.setTitle(title, for: .normal)
            if self.autoRestartSeconds <= 0 {
                timer.invalidate()
                self.coordinator?.showWelcome()
            }
        }
    }

    // MARK: - Acties

    @objc private func reprintTapped() {
        HapticFeedback.impact(.medium)
        printStrip()
    }

    @objc private func newSessionTapped() {
        autoRestartTimer?.invalidate()
        coordinator?.showWelcome()
    }
}
