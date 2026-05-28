import SwiftUI

struct CameraView: View {
    @ObservedObject var vm: PhotoboothViewModel
    @StateObject private var camera = CameraService()

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            // Live camera preview
            if camera.isAuthorized {
                CameraPreviewView(session: camera.session)
                    .ignoresSafeArea()
                    .overlay(flashOverlay)
            } else {
                noCameraPermissionView
            }

            // UI overlay
            VStack {
                topBar
                Spacer()

                // Photo thumbnails
                thumbnailRow

                // Countdown + button
                bottomControls
            }

            // Big countdown number
            if vm.countdown > 0 {
                Text("\(vm.countdown)")
                    .font(.system(size: 220, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                    .shadow(color: .black.opacity(0.6), radius: 20)
                    .transition(.scale.combined(with: .opacity))
                    .id(vm.countdown)
            }
        }
        .onDisappear { camera.stop() }
    }

    // MARK: - Flash overlay
    private var flashOverlay: some View {
        Color.white
            .ignoresSafeArea()
            .opacity(vm.flashVisible ? 1 : 0)
            .animation(.easeOut(duration: 0.15), value: vm.flashVisible)
            .allowsHitTesting(false)
    }

    // MARK: - Top bar
    private var topBar: some View {
        HStack {
            Button(action: { vm.restart() }) {
                Image(systemName: "xmark")
                    .font(.title2.bold())
                    .foregroundColor(.white)
                    .padding(12)
                    .background(.black.opacity(0.4))
                    .clipShape(Circle())
            }
            Spacer()
            Text("Foto \(min(vm.currentPhotoIndex + 1, vm.totalPhotos)) van \(vm.totalPhotos)")
                .font(.headline)
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(.black.opacity(0.4))
                .clipShape(Capsule())
            Spacer()
            // Placeholder for symmetry
            Circle().fill(.clear).frame(width: 44, height: 44)
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
    }

    // MARK: - Thumbnail row
    private var thumbnailRow: some View {
        HStack(spacing: 10) {
            ForEach(0..<vm.totalPhotos, id: \.self) { index in
                Group {
                    if index < vm.session.photos.count {
                        Image(uiImage: vm.session.photos[index])
                            .resizable()
                            .scaledToFill()
                    } else {
                        RoundedRectangle(cornerRadius: 8)
                            .strokeBorder(
                                index == vm.session.photos.count
                                    ? Color.white
                                    : Color.white.opacity(0.3),
                                lineWidth: index == vm.session.photos.count ? 2 : 1
                            )
                            .overlay(
                                Image(systemName: "camera")
                                    .foregroundColor(
                                        index == vm.session.photos.count
                                            ? .white
                                            : .white.opacity(0.3)
                                    )
                            )
                    }
                }
                .frame(width: 90, height: 68)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .padding(.horizontal, 30)
        .padding(.bottom, 20)
    }

    // MARK: - Bottom controls
    private var bottomControls: some View {
        VStack(spacing: 16) {
            if vm.session.photos.count < vm.totalPhotos {
                Button(action: {
                    vm.startCountdown {
                        camera.capturePhoto { image in
                            vm.addPhoto(image)
                        }
                    }
                }) {
                    ZStack {
                        Circle()
                            .fill(.white)
                            .frame(width: 90, height: 90)
                        Circle()
                            .stroke(.white.opacity(0.5), lineWidth: 4)
                            .frame(width: 104, height: 104)
                        if vm.isTakingPhoto {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .black))
                                .scaleEffect(1.5)
                        }
                    }
                }
                .disabled(vm.isTakingPhoto)
                .animation(.easeInOut, value: vm.isTakingPhoto)
            }

            Text(vm.isTakingPhoto ? "Lach!" : "Tik op de knop om een foto te maken")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.white.opacity(0.7))
        }
        .padding(.bottom, 50)
    }

    // MARK: - No permission
    private var noCameraPermissionView: some View {
        VStack(spacing: 20) {
            Image(systemName: "camera.slash")
                .font(.system(size: 60))
                .foregroundColor(.white.opacity(0.5))
            Text("Camera toegang vereist")
                .font(.title2.bold())
                .foregroundColor(.white)
            Text("Ga naar Instellingen → Photobooth → Camera")
                .font(.body)
                .foregroundColor(.white.opacity(0.6))
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}
