import UIKit

final class PaymentViewController: UIViewController {

    weak var coordinator: AppCoordinator?
    var session: PhotoboothSession!

    // MARK: - UI
    private let gradientLayer  = CAGradientLayer()
    private let iconLabel      = UILabel()
    private let titleLabel     = UILabel()
    private let priceLabel     = UILabel()
    private let payButton      = UIButton(type: .system)
    private let backButton     = UIButton(type: .system)
    private let spinner        = UIActivityIndicatorView(style: .white)
    private let waitingLabel   = UILabel()
    private let errorLabel     = UILabel()

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupBackground()
        setupViews()
        setupConstraints()
        NotificationCenter.default.addObserver(self,
            selector: #selector(paymentFailed),
            name: .paymentFailed,
            object: nil)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        gradientLayer.frame = view.bounds
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
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
        iconLabel.text          = "💳"
        iconLabel.font          = .systemFont(ofSize: 80)
        iconLabel.textAlignment = .center
        iconLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(iconLabel)

        titleLabel.text          = "Betaling"
        titleLabel.font          = .systemFont(ofSize: 48, weight: .bold)
        titleLabel.textColor     = .white
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(titleLabel)

        priceLabel.text          = "€\(String(format: "%.2f", AppConfig.price))"
        priceLabel.font          = .systemFont(ofSize: 72, weight: .black)
        priceLabel.textColor     = UIColor(hex: "e94560")
        priceLabel.textAlignment = .center
        priceLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(priceLabel)

        spinner.hidesWhenStopped  = true
        spinner.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(spinner)

        waitingLabel.text          = "Wachten op betaalbevestiging…"
        waitingLabel.font          = .systemFont(ofSize: 18)
        waitingLabel.textColor     = UIColor.white.withAlphaComponent(0.6)
        waitingLabel.textAlignment = .center
        waitingLabel.isHidden      = true
        waitingLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(waitingLabel)

        errorLabel.text          = "⚠️  Betaling mislukt. Probeer opnieuw."
        errorLabel.font          = .systemFont(ofSize: 18, weight: .medium)
        errorLabel.textColor     = UIColor(hex: "e94560")
        errorLabel.textAlignment = .center
        errorLabel.isHidden      = true
        errorLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(errorLabel)

        payButton.setTitle("Betalen met SumUp  ↗", for: .normal)
        payButton.titleLabel?.font    = .systemFont(ofSize: 26, weight: .semibold)
        payButton.setTitleColor(.white, for: .normal)
        payButton.backgroundColor     = UIColor(hex: "e94560")
        payButton.layer.cornerRadius  = 18
        payButton.contentEdgeInsets   = UIEdgeInsets(top: 26, left: 40, bottom: 26, right: 40)
        payButton.translatesAutoresizingMaskIntoConstraints = false
        payButton.addTarget(self, action: #selector(payTapped), for: .touchUpInside)
        view.addSubview(payButton)

        backButton.setTitle("← Terug naar preview", for: .normal)
        backButton.titleLabel?.font = .systemFont(ofSize: 18)
        backButton.setTitleColor(UIColor.white.withAlphaComponent(0.6), for: .normal)
        backButton.translatesAutoresizingMaskIntoConstraints = false
        backButton.addTarget(self, action: #selector(backTapped), for: .touchUpInside)
        view.addSubview(backButton)
    }

    private func setupConstraints() {
        NSLayoutConstraint.activate([
            iconLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            iconLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -180),

            titleLabel.topAnchor.constraint(equalTo: iconLabel.bottomAnchor, constant: 20),
            titleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            priceLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 12),
            priceLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            spinner.topAnchor.constraint(equalTo: priceLabel.bottomAnchor, constant: 30),
            spinner.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            waitingLabel.topAnchor.constraint(equalTo: spinner.bottomAnchor, constant: 12),
            waitingLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            errorLabel.topAnchor.constraint(equalTo: priceLabel.bottomAnchor, constant: 30),
            errorLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            payButton.bottomAnchor.constraint(equalTo: backButton.topAnchor, constant: -16),
            payButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            payButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 50),
            payButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -50),

            backButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -40),
            backButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
        ])
    }

    // MARK: - Acties

    @objc private func payTapped() {
        HapticFeedback.impact(.medium)
        setWaiting(true)
        openSumUp()
    }

    @objc private func backTapped() {
        navigationController?.popViewController(animated: true)
    }

    @objc private func paymentFailed() {
        setWaiting(false)
        errorLabel.isHidden = false
        HapticFeedback.notification(.error)
    }

    private func setWaiting(_ waiting: Bool) {
        errorLabel.isHidden = true
        waitingLabel.isHidden = !waiting
        waiting ? spinner.startAnimating() : spinner.stopAnimating()
        payButton.isEnabled = !waiting
    }

    // MARK: - SumUp

    private func openSumUp() {
        var components = URLComponents()
        components.scheme = "sumupmerchant"
        components.path   = "/pay/1.0"
        components.queryItems = [
            URLQueryItem(name: "affiliate-key",        value: AppConfig.sumupAffiliateKey),
            URLQueryItem(name: "amount",                value: String(format: "%.2f", AppConfig.price)),
            URLQueryItem(name: "currency",              value: AppConfig.currency),
            URLQueryItem(name: "title",                 value: "Fotostrip"),
            URLQueryItem(name: "foreign-tx-id",         value: session.id),
            URLQueryItem(name: "skip-screen-success",   value: "true"),
            URLQueryItem(name: "callbacksuccess",       value: "\(AppConfig.callbackScheme)://payment?status=success&tx=\(session.id)"),
            URLQueryItem(name: "callbackfail",          value: "\(AppConfig.callbackScheme)://payment?status=fail&tx=\(session.id)"),
        ]
        if let url = components.url {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
    }
}
