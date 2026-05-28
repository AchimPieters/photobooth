import SwiftUI

struct WelcomeView: View {
    @ObservedObject var vm: PhotoboothViewModel
    @State private var pulsing = false

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(hex: "1a1a2e"), Color(hex: "16213e"), Color(hex: "0f3460")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 40) {
                Spacer()

                // Logo / icon
                Image(systemName: "camera.aperture")
                    .font(.system(size: 100, weight: .ultraLight))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Color(hex: "e94560"), Color(hex: "f5a623")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .scaleEffect(pulsing ? 1.05 : 1.0)
                    .animation(.easeInOut(duration: 1.8).repeatForever(autoreverses: true), value: pulsing)

                VStack(spacing: 12) {
                    Text("Photobooth")
                        .font(.system(size: 64, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text("4 foto's · direct printen")
                        .font(.system(size: 24, weight: .light))
                        .foregroundColor(.white.opacity(0.6))
                        .tracking(2)
                }

                Spacer()

                // Tap to start
                Button(action: { vm.startSession() }) {
                    Text("Tik om te beginnen")
                        .font(.system(size: 30, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 28)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "e94560"), Color(hex: "c0392b")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .shadow(color: Color(hex: "e94560").opacity(0.5), radius: 20, y: 8)
                }
                .padding(.horizontal, 60)

                Text("€\(String(format: "%.2f", vm.price)) per strip")
                    .font(.system(size: 18, weight: .light))
                    .foregroundColor(.white.opacity(0.4))
                    .padding(.bottom, 50)
            }
        }
        .onAppear { pulsing = true }
    }
}
