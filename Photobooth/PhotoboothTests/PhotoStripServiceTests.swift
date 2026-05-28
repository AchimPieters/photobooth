import XCTest
@testable import Photobooth

final class PhotoStripServiceTests: XCTestCase {

    // MARK: - Helpers

    private func solidImage(color: UIColor, size: CGSize = CGSize(width: 100, height: 133)) -> UIImage {
        UIGraphicsBeginImageContextWithOptions(size, true, 1)
        color.setFill()
        UIRectFill(CGRect(origin: .zero, size: size))
        let img = UIGraphicsGetImageFromCurrentImageContext()!
        UIGraphicsEndImageContext()
        return img
    }

    // MARK: - Tests

    func testBuildStripReturnsImageForFourPhotos() {
        let photos = (0..<4).map { _ in solidImage(color: .red) }
        let strip = PhotoStripService.buildStrip(from: photos)
        XCTAssertNotNil(strip)
    }

    func testBuildStripReturnsNilForEmptyArray() {
        let strip = PhotoStripService.buildStrip(from: [])
        XCTAssertNil(strip)
    }

    func testBuildStripReturnsImageForSinglePhoto() {
        let strip = PhotoStripService.buildStrip(from: [solidImage(color: .blue)])
        XCTAssertNotNil(strip)
    }

    func testBuildStripHasCorrectWidth() {
        let config = PhotoStripService.StripConfig()
        let photos = (0..<4).map { _ in solidImage(color: .green) }
        let strip = PhotoStripService.buildStrip(from: photos, config: config)!
        let expectedWidth = config.photoWidth + config.padding * 2
        XCTAssertEqual(strip.size.width, expectedWidth, accuracy: 1.0)
    }

    func testBuildStripWithCustomFooterText() {
        var config = PhotoStripService.StripConfig()
        config.footerText = "Test Event 2026"
        let photos = (0..<4).map { _ in solidImage(color: .yellow) }
        let strip = PhotoStripService.buildStrip(from: photos, config: config)
        XCTAssertNotNil(strip)
    }

    func testBuildStripHeightGrowsWithMorePhotos() {
        let twoPhotos  = (0..<2).map { _ in solidImage(color: .red) }
        let fourPhotos = (0..<4).map { _ in solidImage(color: .red) }
        let strip2 = PhotoStripService.buildStrip(from: twoPhotos)!
        let strip4 = PhotoStripService.buildStrip(from: fourPhotos)!
        XCTAssertGreaterThan(strip4.size.height, strip2.size.height)
    }
}
