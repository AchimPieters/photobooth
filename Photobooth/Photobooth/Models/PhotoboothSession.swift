import UIKit

/// Represents a single photobooth session
struct PhotoboothSession: Identifiable {
    let id: String
    var photos: [UIImage] = []
    var stripImage: UIImage?
    var paymentStatus: PaymentStatus = .pending
    var createdAt: Date = Date()

    enum PaymentStatus {
        case pending
        case success
        case failed
    }

    init() {
        self.id = UUID().uuidString
    }
}
