import XCTest

final class PhotoboothUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        // Disable animations for faster, deterministic tests
        app.launchArguments += ["-UIAnimationDurationScale", "0"]
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
    }

    // MARK: - Welcome screen

    func testWelcomeScreenShowsAppName() {
        XCTAssertTrue(app.staticTexts["Photobooth"].exists)
    }

    func testWelcomeScreenShowsStartButton() {
        XCTAssertTrue(app.buttons["Tik om te beginnen"].exists)
    }

    func testWelcomeScreenShowsPrice() {
        // Price label contains "€"
        let priceLabel = app.staticTexts.matching(NSPredicate(format: "label CONTAINS '€'"))
        XCTAssertTrue(priceLabel.firstMatch.exists)
    }

    func testTappingStartButtonNavigatesToCamera() {
        app.buttons["Tik om te beginnen"].tap()
        // Camera screen shows a shutter button (accessibility label or the thumbnail row)
        let shutterExists = app.buttons.matching(
            NSPredicate(format: "label CONTAINS 'foto' OR label CONTAINS 'camera'")
        ).firstMatch.waitForExistence(timeout: 3)
        // On simulator without camera it may show permission denied view — either is valid
        XCTAssertTrue(shutterExists || app.staticTexts["Camera toegang vereist"].exists)
    }

    // MARK: - Restart / back flow

    func testClosingCameraReturnsToWelcome() {
        app.buttons["Tik om te beginnen"].tap()
        // Tap the X / close button
        let closeBtn = app.buttons.matching(NSPredicate(format: "label CONTAINS 'xmark' OR label CONTAINS 'sluiten'")).firstMatch
        if closeBtn.waitForExistence(timeout: 3) {
            closeBtn.tap()
            XCTAssertTrue(app.staticTexts["Photobooth"].waitForExistence(timeout: 3))
        }
    }
}
