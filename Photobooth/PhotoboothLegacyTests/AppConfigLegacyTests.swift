import XCTest
@testable import PhotoboothLegacy

final class AppConfigLegacyTests: XCTestCase {
    func testPriceIsPositive()         { XCTAssertGreaterThan(AppConfig.price, 0) }
    func testTotalPhotosIsPositive()   { XCTAssertGreaterThan(AppConfig.totalPhotos, 0) }
    func testCountdownIsPositive()     { XCTAssertGreaterThan(AppConfig.countdownSecs, 0) }
    func testAutoRestartIsPositive()   { XCTAssertGreaterThan(AppConfig.autoRestartSec, 0) }
    func testCurrencyIsEUR()           { XCTAssertEqual(AppConfig.currency, "EUR") }
    func testCallbackSchemeNotEmpty()  { XCTAssertFalse(AppConfig.callbackScheme.isEmpty) }
}
