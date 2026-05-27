import SwiftUI
import AVFoundation
import Combine

@MainActor
class PhotoboothViewModel: ObservableObject {

    // MARK: - Navigation state
    enum Screen {
        case welcome
        case camera
        case preview
        case payment
        case done
    }

    @Published var currentScreen: Screen = .welcome
    @Published var session = PhotoboothSession()

    // MARK: - Camera state
    @Published var countdown: Int = 0
    @Published var isTakingPhoto: Bool = false
    @Published var flashVisible: Bool = false
    @Published var currentPhotoIndex: Int = 0

    // MARK: - Config
    let totalPhotos = 4
    let countdownSeconds = 3
    let price = 3.00
    let currency = "EUR"
    var sumupAffiliateKey = "JOUW_AFFILIATE_KEY_HIER" // ← vervangen met echte key

    private var countdownTask: Task<Void, Never>?

    // MARK: - Navigation
    func startSession() {
        session = PhotoboothSession()
        currentPhotoIndex = 0
        currentScreen = .camera
    }

    func goToPreview() {
        currentScreen = .preview
    }

    func goToPayment() {
        currentScreen = .payment
    }

    func goToDone() {
        currentScreen = .done
    }

    func restart() {
        countdownTask?.cancel()
        session = PhotoboothSession()
        currentPhotoIndex = 0
        countdown = 0
        isTakingPhoto = false
        currentScreen = .welcome
    }

    // MARK: - Countdown
    func startCountdown(captureAction: @escaping () -> Void) {
        guard !isTakingPhoto else { return }
        isTakingPhoto = true
        countdown = countdownSeconds

        countdownTask = Task {
            for i in stride(from: countdownSeconds, through: 1, by: -1) {
                if Task.isCancelled { return }
                await MainActor.run { countdown = i }
                try? await Task.sleep(nanoseconds: 1_000_000_000)
            }
            if Task.isCancelled { return }
            await MainActor.run {
                countdown = 0
                flashVisible = true
            }
            captureAction()
            try? await Task.sleep(nanoseconds: 300_000_000)
            await MainActor.run { flashVisible = false }
            try? await Task.sleep(nanoseconds: 700_000_000)
            await MainActor.run { isTakingPhoto = false }
        }
    }

    // MARK: - Photo handling
    func addPhoto(_ image: UIImage) {
        session.photos.append(image)
        currentPhotoIndex = session.photos.count

        if session.photos.count >= totalPhotos {
            // Auto-advance to preview after short delay
            Task {
                try? await Task.sleep(nanoseconds: 800_000_000)
                await MainActor.run { currentScreen = .preview }
            }
        }
    }

    // MARK: - SumUp payment
    func openSumUp() {
        let callbackBase = "photobooth://payment"
        let txId = session.id

        var components = URLComponents()
        components.scheme = "sumupmerchant"
        components.path = "/pay/1.0"
        components.queryItems = [
            URLQueryItem(name: "affiliate-key", value: sumupAffiliateKey),
            URLQueryItem(name: "amount", value: String(format: "%.2f", price)),
            URLQueryItem(name: "currency", value: currency),
            URLQueryItem(name: "title", value: "Fotostrip"),
            URLQueryItem(name: "foreign-tx-id", value: txId),
            URLQueryItem(name: "skip-screen-success", value: "true"),
            URLQueryItem(name: "callbacksuccess", value: "\(callbackBase)?status=success&tx=\(txId)"),
            URLQueryItem(name: "callbackfail", value: "\(callbackBase)?status=fail&tx=\(txId)"),
        ]

        if let url = components.url {
            UIApplication.shared.open(url)
        }
    }

    func handlePaymentCallback(url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let status = components.queryItems?.first(where: { $0.name == "status" })?.value
        else { return }

        if status == "success" {
            session.paymentStatus = .success
            currentScreen = .done
        } else {
            session.paymentStatus = .failed
        }
    }

    // MARK: - AirPrint
    func printStrip() {
        guard let strip = session.stripImage else { return }
        let printInfo = UIPrintInfo(dictionary: nil)
        printInfo.jobName = "Fotostrip"
        printInfo.outputType = .photo

        let controller = UIPrintInteractionController.shared
        controller.printInfo = printInfo
        controller.printingItem = strip
        controller.present(animated: true)
    }
}
