import SwiftUI

struct PreviewView: View {
    @ObservedObject var vm: PhotoboothViewModel
    @State private var stripImage: UIImage?
    @State private var isBuilding = true

    var body: some View {
        ZStack {
            Color(hex: "1a1a2e").ignoresSafeArea()

            VStack(spacing: 30) {
                Text("Jouw fotostrip")
                    .font(.system(size: 40, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .padding(.top, 40)

                // Strip preview
                if isBuilding {
                    VStack(spacing: 16) {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(2)
                        Text("Strip wordt gemaakt…")
                            .foregroundColor(.white.opacity(0.6))
                    }
                    .frame(maxHeight: .infinity)
                } else if let strip = stripImage {
                    ScrollView {
                        Image(uiImage: strip)
                            .resizable()
                            .scaledToFit()
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .shadow(color: .black.opacity(0.6), radius: 20, y: 10)
                            .padding(.horizontal, 40)
                    }
                }

                Spacer()

                // Action buttons
                VStack(spacing: 16) {
                    Button(action: {
                        vm.session.stripImage = stripImage
                        vm.goToPayment()
                    }) {
                        Label("Betalen & printen  –  €\(String(format: "%.2f", vm.price))",
                              systemImage: "creditcard.fill")
                            .font(.system(size: 24, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 24)
                            .background(
                                LinearGradient(
                                    colors: [Color(hex: "e94560"), Color(hex: "c0392b")],
                                    startPoint: .leading, endPoint: .trailing
                                )
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 18))
                    }

                    Button(action: { vm.startSession() }) {
                        Label("Opnieuw proberen", systemImage: "arrow.counterclockwise")
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background(.white.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 18))
                    }
                }
                .padding(.horizontal, 50)
                .padding(.bottom, 50)
            }
        }
        .task {
            // Build strip off the main thread
            let photos = vm.session.photos
            let strip = await Task.detached(priority: .userInitiated) {
                PhotoStripService.buildStrip(from: photos)
            }.value
            stripImage = strip
            isBuilding = false
        }
    }
}
