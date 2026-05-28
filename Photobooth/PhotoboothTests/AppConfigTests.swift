import XCTest
@testable import Photobooth

final class AppConfigTests: XCTestCase {

    func testPriceIsPositive() {
        XCTAssertGreaterThan(AppConfig.price, 0)
    }

    func testTotalPhotosIsPositive() {
        XCTAssertGreaterThan(AppConfig.totalPhotos, 0)
    }

    func testCountdownSecsIsPositive() {
        XCTAssertGreaterThan(AppConfig.countdownSecs, 0)
    }

    func testAutoRestartSecIsPositive() {
        XCTAssertGreaterThan(AppConfig.autoRestartSec, 0)
    }

    func testCallbackSchemeIsNotEmpty() {
        XCTAssertFalse(AppConfig.callbackScheme.isEmpty)
    }

    func testCurrencyIsEUR() {
        XCTAssertEqual(AppConfig.currency, "EUR")
    }

    func testStripFooterTextIsNotEmpty() {
        XCTAssertFalse(AppConfig.stripFooterText.isEmpty)
    }
}
