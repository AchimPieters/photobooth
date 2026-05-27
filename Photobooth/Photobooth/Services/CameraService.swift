import AVFoundation
import UIKit
import SwiftUI

/// Manages the AVFoundation camera session
class CameraService: NSObject, ObservableObject {

    @Published var isAuthorized = false
    @Published var capturedImage: UIImage?

    let session = AVCaptureSession()
    private let photoOutput = AVCapturePhotoOutput()
    private var captureCompletion: ((UIImage) -> Void)?

    override init() {
        super.init()
        checkAuthorization()
    }

    private func checkAuthorization() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            setupSession()
            isAuthorized = true
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                DispatchQueue.main.async {
                    self?.isAuthorized = granted
                    if granted { self?.setupSession() }
                }
            }
        default:
            isAuthorized = false
        }
    }

    private func setupSession() {
        session.beginConfiguration()
        session.sessionPreset = .photo

        // Prefer front camera for photobooth
        let position: AVCaptureDevice.Position = .front
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera,
                                                    for: .video,
                                                    position: position),
              let input = try? AVCaptureDeviceInput(device: device)
        else {
            session.commitConfiguration()
            return
        }

        if session.canAddInput(input) { session.addInput(input) }
        if session.canAddOutput(photoOutput) { session.addOutput(photoOutput) }

        session.commitConfiguration()

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.session.startRunning()
        }
    }

    func capturePhoto(completion: @escaping (UIImage) -> Void) {
        captureCompletion = completion
        let settings = AVCapturePhotoSettings()
        settings.flashMode = .auto
        photoOutput.capturePhoto(with: settings, delegate: self)
    }

    func stop() {
        session.stopRunning()
    }
}

// MARK: - AVCapturePhotoCaptureDelegate
extension CameraService: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput,
                     didFinishProcessingPhoto photo: AVCapturePhoto,
                     error: Error?) {
        guard error == nil,
              let data = photo.fileDataRepresentation(),
              let image = UIImage(data: data)
        else { return }

        DispatchQueue.main.async { [weak self] in
            self?.captureCompletion?(image)
            self?.captureCompletion = nil
        }
    }
}
