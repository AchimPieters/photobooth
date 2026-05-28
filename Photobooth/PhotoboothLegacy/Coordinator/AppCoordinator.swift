import UIKit

/// Beheert de volledige navigatiestroom van de photobooth.
/// Elke ViewController kent alleen de coordinator — nooit andere VCs.
final class AppCoordinator {

    private let window: UIWindow
    private let navigationController: UINavigationController
    private var session: PhotoboothSession?

    init(window: UIWindow) {
        self.window = window
        let nav = UINavigationController()
        nav.setNavigationBarHidden(true, animated: false)
        self.navigationController = nav
    }

    func start() {
        window.rootViewController = navigationController
        showWelcome()
    }

    // MARK: - Navigation

    func showWelcome() {
        session = nil
        let vc = WelcomeViewController()
        vc.coordinator = self
        navigationController.setViewControllers([vc], animated: false)
    }

    func showCamera() {
        session = PhotoboothSession()
        let vc = CameraViewController()
        vc.coordinator = self
        vc.session = session!
        navigationController.pushViewController(vc, animated: true)
    }

    func showPreview(session: PhotoboothSession) {
        self.session = session
        let vc = PreviewViewController()
        vc.coordinator = self
        vc.session = session
        navigationController.pushViewController(vc, animated: true)
    }

    func showPayment(session: PhotoboothSession) {
        self.session = session
        let vc = PaymentViewController()
        vc.coordinator = self
        vc.session = session
        navigationController.pushViewController(vc, animated: true)
    }

    func showDone(session: PhotoboothSession) {
        self.session = session
        let vc = DoneViewController()
        vc.coordinator = self
        vc.session = session
        navigationController.pushViewController(vc, animated: true)
    }

    // MARK: - SumUp callback

    func handleURL(_ url: URL) {
        guard url.scheme == AppConfig.callbackScheme,
              url.host == "payment",
              let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let status = components.queryItems?.first(where: { $0.name == "status" })?.value
        else { return }

        if status == "success" {
            if var s = session {
                s.paymentStatus = .success
                self.session = s
                showDone(session: s)
            }
        } else {
            // Payment failed — PaymentViewController toont de foutmelding zelf
            NotificationCenter.default.post(name: .paymentFailed, object: nil)
        }
    }
}

extension Notification.Name {
    static let paymentFailed = Notification.Name("PhotoboothPaymentFailed")
}
