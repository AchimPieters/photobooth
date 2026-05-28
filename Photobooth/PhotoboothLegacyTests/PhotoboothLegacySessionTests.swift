import XCTest
@testable import PhotoboothLegacy

final class PhotoboothLegacySessionTests: XCTestCase {

    func testSessionHasUniqueIDs() {
        let s1 = PhotoboothSession()
        let s2 = PhotoboothSession()
        XCTAssertNotEqual(s1.id, s2.id)
    }

    func testSessionDefaultState() {
        let s = PhotoboothSession()
        XCTAssertTrue(s.photos.isEmpty)
        XCTAssertNil(s.stripImage)
        XCTAssertEqual(s.paymentStatus, .pending)
    }
}
