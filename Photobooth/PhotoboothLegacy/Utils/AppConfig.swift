import Foundation

/// Single source of truth voor alle runtime-configuratie.
/// Leest uit Info.plist, valt terug op compile-time defaults.
enum AppConfig {

    // MARK: - Betaling
    static let sumupAffiliateKey: String = plist("SUMUP_AFFILIATE_KEY") ?? "YOUR_AFFILIATE_KEY_HERE"
    static let price: Double = {
        if let raw = plist("PHOTOBOOTH_PRICE"), let v = Double(raw) { return v }
        return 3.00
    }()
    static let currency = "EUR"

    // MARK: - Gedrag
    static let totalPhotos    = 4
    static let countdownSecs  = 3
    static let autoRestartSec = 15

    // MARK: - Strip
    static let stripFooterText = "Photobooth ✦ 2026"

    // MARK: - URL scheme (moet overeenkomen met Info.plist CFBundleURLSchemes)
    static let callbackScheme = "photobooth"

    // MARK: - Privé helper
    private static func plist(_ key: String) -> String? {
        Bundle.main.object(forInfoDictionaryKey: key) as? String
    }
}
