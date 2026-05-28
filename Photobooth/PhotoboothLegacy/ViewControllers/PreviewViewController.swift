import UIKit

final class PreviewViewController: UIViewController {

    weak var coordinator: AppCoordinator?
    var session: PhotoboothSession!

    // MARK: - UI
    private let gradientLayer  = CAGradientLayer()
    private let titleLabel     = UILabel()
    private let scrollView     = UIScrollView()
    private let stripImageView = UIImageView()
    private let spinner        = UIActivityIndicatorView(style: .whiteLarge)
    private let buildingLabel  = UILabel()
    private let payButton      = UIButton(type: .system)
    private let retryButton    = UIButton(type: .system)

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupBackground()
        setupViews()
        setupConstraints()
        buildStrip()
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
        titleLabel.text          = "Jouw fotostrip"
        titleLabel.font          = .systemFont(ofSize: 40, weight: .bold)
        titleLabel.textColor     = .white
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(titleLabel)

        spinner.hidesWhenStopped = true
        spinner.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(spinner)

        buildingLabel.text          = "Strip wordt gemaakt…"
        buildingLabel.font          = .systemFont(ofSize: 18)
        buildingLabel.textColor     = UIColor.white.withAlphaComponent(0.6)
        buildingLabel.textAlignment = .center
        buildingLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(buildingLabel)

        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        stripImageView.contentMode       = .scaleAspectFit
        stripImageView.layer.cornerRadius = 12
        stripImageView.clipsToBounds      = true
        stripImageView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(stripImageView)

        payButton.setTitle("Betalen & printen  –  €\(String(format: "%.2f", AppConfig.price))", for: .normal)
        payButton.titleLabel?.font    = .systemFont(ofSize: 22, weight: .semibold)
        payButton.setTitleColor(.white, for: .normal)
        payButton.backgroundColor     = UIColor(hex: "e94560")
        payButton.layer.cornerRadius  = 18
        payButton.contentEdgeInsets   = UIEdgeInsets(top: 22, left: 30, bottom: 22, right: 30)
        payButton.translatesAutoresizingMaskIntoConstraints = false
        payButton.addTarget(self, action: #selector(payTapped), for: .touchUpInside)
        view.addSubview(payButton)

        retryButton.setTitle("↩  Opnieuw proberen", for: .normal)
        retryButton.titleLabel?.font = .systemFont(ofSize: 18, weight: .medium)
        retryButton.setTitleColor(UIColor.white.withAlphaComponent(0.6), for: .normal)
        retryButton.translatesAutoresizingMaskIntoConstraints = false
        retryButton.addTarget(self, action: #selector(retryTapped), for: .touchUpInside)
        view.addSubview(retryButton)
    }

    private func setupConstraints() {
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 30),
            titleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            spinner.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            spinner.centerYAnchor.constraint(equalTo: view.centerYAnchor),

            buildingLabel.topAnchor.constraint(equalTo: spinner.bottomAnchor, constant: 16),
            buildingLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            scrollView.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 20),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 40),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -40),
            scrollView.bottomAnchor.constraint(equalTo: payButton.topAnchor, constant: -20),

            stripImageView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            stripImageView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            stripImageView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            stripImageView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            stripImageView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),

            payButton.bottomAnchor.constraint(equalTo: retryButton.topAnchor, constant: -16),
            payButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            payButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 50),
            payButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -50),

            retryButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -40),
            retryButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
        ])
    }

    // MARK: - Strip bouwen

    private func buildStrip() {
        spinner.startAnimating()
        buildingLabel.isHidden = false
        scrollView.isHidden    = true
        payButton.isEnabled    = false

        let photos = session.photos
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            let strip = PhotoStripService.buildStrip(from: photos)
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.spinner.stopAnimating()
                self.buildingLabel.isHidden = true
                if let strip = strip {
                    self.session.stripImage = strip
                    self.stripImageView.image = strip
                    self.stripImageView.heightAnchor.constraint(
                        equalTo: self.stripImageView.widthAnchor,
                        multiplier: strip.size.height / strip.size.width
                    ).isActive = true
                    self.scrollView.isHidden = false
                    self.payButton.isEnabled = true
                }
            }
        }
    }

    // MARK: - Acties

    @objc private func payTapped() {
        HapticFeedback.impact(.medium)
        coordinator?.showPayment(session: session)
    }

    @objc private func retryTapped() {
        coordinator?.showCamera()
    }
}
