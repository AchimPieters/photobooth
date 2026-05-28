import XCTest
@testable import Photobooth

final class PhotoboothSessionTests: XCTestCase {

    func testSessionHasUniqueIDs() {
        let s1 = PhotoboothSession()
        let s2 = PhotoboothSession()
        XCTAssertNotEqual(s1.id, s2.id)
    }

    func testSessionDefaultState() {
        let session = PhotoboothSession()
        XCTAssertTrue(session.photos.isEmpty)
        XCTAssertNil(session.stripImage)
        XCTAssertEqual(session.paymentStatus, .pending)
    }

    func testSessionPhotosMutation() {
        var session = PhotoboothSession()
        session.photos.append(UIImage())
        XCTAssertEqual(session.photos.count, 1)
    }
}
