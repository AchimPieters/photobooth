import XCTest
@testable import PhotoboothLegacy

final class PhotoboothLegacyPhotoStripTests: XCTestCase {

    private func solidImage(color: UIColor) -> UIImage {
        UIGraphicsBeginImageContextWithOptions(CGSize(width: 100, height: 133), true, 1)
        color.setFill()
        UIRectFill(CGRect(x: 0, y: 0, width: 100, height: 133))
        let img = UIGraphicsGetImageFromCurrentImageContext()!
        UIGraphicsEndImageContext()
        return img
    }

    func testBuildStripReturnsImageForFourPhotos() {
        let photos = (0..<4).map { _ in solidImage(color: .red) }
        XCTAssertNotNil(PhotoStripService.buildStrip(from: photos))
    }

    func testBuildStripReturnsNilForEmptyArray() {
        XCTAssertNil(PhotoStripService.buildStrip(from: []))
    }

    func testBuildStripHeightGrowsWithMorePhotos() {
        let two  = (0..<2).map { _ in solidImage(color: .blue) }
        let four = (0..<4).map { _ in solidImage(color: .blue) }
        let h2 = PhotoStripService.buildStrip(from: two)!.size.height
        let h4 = PhotoStripService.buildStrip(from: four)!.size.height
        XCTAssertGreaterThan(h4, h2)
    }

    func testBuildStripCorrectWidth() {
        let config = PhotoStripService.StripConfig()
        let photos = (0..<4).map { _ in solidImage(color: .green) }
        let strip  = PhotoStripService.buildStrip(from: photos, config: config)!
        XCTAssertEqual(strip.size.width, config.photoWidth + config.padding * 2, accuracy: 1.0)
    }
}
