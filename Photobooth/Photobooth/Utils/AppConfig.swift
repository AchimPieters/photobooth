import Foundation

/// Single source of truth for all runtime configuration.
/// Reads from Info.plist first, falls back to compile-time defaults.
/// Override via Xcode scheme environment variables during development.
enum AppConfig {

    // MARK: - Payment
    /// SumUp affiliate key — set via Info.plist key `SUMUP_AFFILIATE_KEY`
    static let sumupAffiliateKey: String = {
        plist("SUMUP_AFFILIATE_KEY") ?? "YOUR_AFFILIATE_KEY_HERE"
    }()

    /// Price per strip in EUR
    static let price: Double = {
        if let raw = plist("PHOTOBOOTH_PRICE"), let v = Double(raw) { return v }
        return 3.00
    }()

    static let currency = "EUR"

    // MARK: - Photobooth behaviour
    static let totalPhotos    = 4
    static let countdownSecs  = 3
    static let autoRestartSec = 15

    // MARK: - Photo strip
    static let stripFooterText = "Photobooth ✦ 2026"

    // MARK: - URL scheme (must match Info.plist CFBundleURLSchemes)
    static let callbackScheme = "photobooth"

    // MARK: - Private helpers
    private static func plist(_ key: String) -> String? {
        Bundle.main.object(forInfoDictionaryKey: key) as? String
    }
}
