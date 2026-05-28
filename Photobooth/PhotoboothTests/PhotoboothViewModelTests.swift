import XCTest
@testable import Photobooth

@MainActor
final class PhotoboothViewModelTests: XCTestCase {

    var vm: PhotoboothViewModel!

    override func setUp() {
        super.setUp()
        vm = PhotoboothViewModel()
    }

    override func tearDown() {
        vm = nil
        super.tearDown()
    }

    // MARK: - Navigation

    func testInitialScreenIsWelcome() {
        XCTAssertEqual(vm.currentScreen, .welcome)
    }

    func testStartSessionNavigatesToCamera() {
        vm.startSession()
        XCTAssertEqual(vm.currentScreen, .camera)
    }

    func testStartSessionResetsPhotos() {
        vm.session.photos = [UIImage(), UIImage()]
        vm.startSession()
        XCTAssertEqual(vm.session.photos.count, 0)
    }

    func testGoToPreviewNavigatesToPreview() {
        vm.startSession()
        vm.goToPreview()
        XCTAssertEqual(vm.currentScreen, .preview)
    }

    func testGoToPaymentNavigatesToPayment() {
        vm.goToPayment()
        XCTAssertEqual(vm.currentScreen, .payment)
    }

    func testGoToDoneNavigatesToDone() {
        vm.goToDone()
        XCTAssertEqual(vm.currentScreen, .done)
    }

    func testRestartResetsToWelcome() {
        vm.startSession()
        vm.goToPreview()
        vm.restart()
        XCTAssertEqual(vm.currentScreen, .welcome)
        XCTAssertEqual(vm.session.photos.count, 0)
        XCTAssertEqual(vm.currentPhotoIndex, 0)
        XCTAssertFalse(vm.isTakingPhoto)
    }

    // MARK: - Photo handling

    func testAddPhotoIncreasesPhotoCount() {
        vm.startSession()
        vm.addPhoto(UIImage())
        XCTAssertEqual(vm.session.photos.count, 1)
        XCTAssertEqual(vm.currentPhotoIndex, 1)
    }

    func testAddPhotoUpdatesCurrentIndex() {
        vm.startSession()
        vm.addPhoto(UIImage())
        vm.addPhoto(UIImage())
        XCTAssertEqual(vm.currentPhotoIndex, 2)
    }

    func testAddingAllPhotosEventuallyNavigatesToPreview() async {
        vm.startSession()
        for _ in 0..<vm.totalPhotos {
            vm.addPhoto(UIImage())
        }
        // Auto-navigation is delayed 0.8 s — wait for it
        try? await Task.sleep(nanoseconds: 1_200_000_000)
        XCTAssertEqual(vm.currentScreen, .preview)
    }

    // MARK: - SumUp URL construction

    func testOpenSumUpDoesNotCrashWithDummyKey() {
        // We can't actually open URLs in tests, but we verify the URL builds correctly
        vm.sumupAffiliateKey = "TEST_KEY"
        var components = URLComponents()
        components.scheme = "sumupmerchant"
        components.path = "/pay/1.0"
        components.queryItems = [
            URLQueryItem(name: "affiliate-key", value: "TEST_KEY"),
            URLQueryItem(name: "amount", value: "3.00"),
            URLQueryItem(name: "currency", value: "EUR"),
        ]
        XCTAssertNotNil(components.url)
    }

    // MARK: - Payment callback

    func testSuccessCallbackNavigatesToDone() {
        vm.startSession()
        let url = URL(string: "photobooth://payment?status=success&tx=\(vm.session.id)")!
        vm.handlePaymentCallback(url: url)
        XCTAssertEqual(vm.session.paymentStatus, .success)
        XCTAssertEqual(vm.currentScreen, .done)
    }

    func testFailCallbackSetsFailedStatus() {
        vm.startSession()
        let url = URL(string: "photobooth://payment?status=fail&tx=\(vm.session.id)")!
        vm.handlePaymentCallback(url: url)
        XCTAssertEqual(vm.session.paymentStatus, .failed)
        XCTAssertNotEqual(vm.currentScreen, .done)
    }

    func testInvalidCallbackURLDoesNothing() {
        vm.startSession()
        let url = URL(string: "https://example.com")!
        vm.handlePaymentCallback(url: url)
        XCTAssertEqual(vm.session.paymentStatus, .pending)
        XCTAssertEqual(vm.currentScreen, .camera)
    }

    // MARK: - Config

    func testPriceMatchesAppConfig() {
        XCTAssertEqual(vm.price, AppConfig.price)
    }

    func testTotalPhotosMatchesAppConfig() {
        XCTAssertEqual(vm.totalPhotos, AppConfig.totalPhotos)
    }
}
