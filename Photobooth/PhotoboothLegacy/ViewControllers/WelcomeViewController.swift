import UIKit

final class WelcomeViewController: UIViewController {

    weak var coordinator: AppCoordinator?

    // MARK: - UI
    private let gradientLayer = CAGradientLayer()
    private let iconLabel     = UILabel()
    private let titleLabel    = UILabel()
    private let subtitleLabel = UILabel()
    private let startButton   = UIButton(type: .system)
    private let priceLabel    = UILabel()
    private var pulseTimer: Timer?

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupBackground()
        setupViews()
        setupConstraints()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        gradientLayer.frame = view.bounds
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        startPulse()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        pulseTimer?.invalidate()
    }

    override var prefersStatusBarHidden: Bool { true }

    // MARK: - Setup

    private func setupBackground() {
        gradientLayer.colors = [
            UIColor(hex: "1a1a2e").cgColor,
            UIColor(hex: "16213e").cgColor,
            UIColor(hex: "0f3460").cgColor,
        ]
        gradientLayer.startPoint = CGPoint(x: 0, y: 0)
        gradientLayer.endPoint   = CGPoint(x: 1, y: 1)
        view.layer.insertSublayer(gradientLayer, at: 0)
    }

    private func setupViews() {
        // Camera-icoon
        iconLabel.text      = "⦿"
        iconLabel.font      = .systemFont(ofSize: 100, weight: .ultraLight)
        iconLabel.textColor = UIColor(hex: "e94560")
        iconLabel.textAlignment = .center
        iconLabel.translatesAutoresizingMaskIntoConstraints = false

        // Titel
        titleLabel.text          = "Photobooth"
        titleLabel.font          = .systemFont(ofSize: 64, weight: .bold)
        titleLabel.textColor     = .white
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false

        // Subtitel
        subtitleLabel.text          = "4 foto's · direct printen"
        subtitleLabel.font          = .systemFont(ofSize: 24, weight: .light)
        subtitleLabel.textColor     = UIColor.white.withAlphaComponent(0.6)
        subtitleLabel.textAlignment = .center
        subtitleLabel.translatesAutoresizingMaskIntoConstraints = false

        // Start-knop
        startButton.setTitle("Tik om te beginnen", for: .normal)
        startButton.titleLabel?.font    = .systemFont(ofSize: 30, weight: .semibold)
        startButton.setTitleColor(.white, for: .normal)
        startButton.backgroundColor     = UIColor(hex: "e94560")
        startButton.layer.cornerRadius  = 20
        startButton.contentEdgeInsets   = UIEdgeInsets(top: 28, left: 40, bottom: 28, right: 40)
        startButton.translatesAutoresizingMaskIntoConstraints = false
        startButton.addTarget(self, action: #selector(startTapped), for: .touchUpInside)

        // Prijslabel
        priceLabel.text          = "€\(String(format: "%.2f", AppConfig.price)) per strip"
        priceLabel.font          = .systemFont(ofSize: 18, weight: .light)
        priceLabel.textColor     = UIColor.white.withAlphaComponent(0.4)
        priceLabel.textAlignment = .center
        priceLabel.translatesAutoresizingMaskIntoConstraints = false

        [iconLabel, titleLabel, subtitleLabel, startButton, priceLabel].forEach {
            view.addSubview($0)
        }
    }

    private func setupConstraints() {
        NSLayoutConstraint.activate([
            iconLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            iconLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -160),

            titleLabel.topAnchor.constraint(equalTo: iconLabel.bottomAnchor, constant: 24),
            titleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 12),
            subtitleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            startButton.bottomAnchor.constraint(equalTo: priceLabel.topAnchor, constant: -20),
            startButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            startButton.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 60),
            startButton.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -60),

            priceLabel.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -50),
            priceLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
        ])
    }

    // MARK: - Pulse animatie

    private func startPulse() {
        UIView.animate(withDuration: 1.8,
                       delay: 0,
                       options: [.autoreverse, .repeat, .allowUserInteraction],
                       animations: {
            self.iconLabel.transform = CGAffineTransform(scaleX: 1.06, y: 1.06)
        })
    }

    // MARK: - Acties

    @objc private func startTapped() {
        HapticFeedback.impact(.medium)
        coordinator?.showCamera()
    }
}
