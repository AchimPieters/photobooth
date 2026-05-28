import SwiftUI

struct DoneView: View {
    @ObservedObject var vm: PhotoboothViewModel
    @State private var confettiVisible = true
    @State private var countdown = 15
    @State private var countdownTask: Task<Void, Never>?

    var body: some View {
        ZStack {
            Color(hex: "1a1a2e").ignoresSafeArea()

            VStack(spacing: 36) {
                Spacer()

                // Success icon
                ZStack {
                    Circle()
                        .fill(Color(hex: "27ae60").opacity(0.15))
                        .frame(width: 160, height: 160)
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 100))
                        .foregroundColor(Color(hex: "27ae60"))
                }
                .scaleEffect(confettiVisible ? 1.0 : 0.5)
                .animation(.spring(response: 0.5, dampingFraction: 0.6), value: confettiVisible)

                VStack(spacing: 12) {
                    Text("Betaald!")
                        .font(.system(size: 52, weight: .black, design: .rounded))
                        .foregroundColor(.white)

                    Text("Je strip wordt nu geprint.")
                        .font(.system(size: 24, weight: .light))
                        .foregroundColor(.white.opacity(0.7))
                }

                // Strip thumbnail
                if let strip = vm.session.stripImage {
                    Image(uiImage: strip)
                        .resizable()
                        .scaledToFit()
                        .frame(height: 280)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .shadow(color: .black.opacity(0.5), radius: 16, y: 8)
                }

                Spacer()

                // Action buttons
                VStack(spacing: 16) {
                    Button(action: { vm.printStrip() }) {
                        Label("Opnieuw printen", systemImage: "printer.fill")
                            .font(.system(size: 22, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 22)
                            .background(.white.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 18))
                    }

                    Button(action: { vm.restart() }) {
                        Label("Nieuwe sessie starten  (\(countdown)s)", systemImage: "arrow.counterclockwise")
                            .font(.system(size: 22, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 22)
                            .background(
                                LinearGradient(
                                    colors: [Color(hex: "e94560"), Color(hex: "c0392b")],
                                    startPoint: .leading, endPoint: .trailing
                                )
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 18))
                    }
                }
                .padding(.horizontal, 50)
                .padding(.bottom, 50)
            }
        }
        .onAppear {
            confettiVisible = true
            vm.printStrip()
            startAutoRestart()
        }
        .onDisappear {
            countdownTask?.cancel()
        }
    }

    private func startAutoRestart() {
        countdownTask = Task {
            for i in stride(from: 15, through: 1, by: -1) {
                if Task.isCancelled { return }
                await MainActor.run { countdown = i }
                try? await Task.sleep(nanoseconds: 1_000_000_000)
            }
            if Task.isCancelled { return }
            await MainActor.run { vm.restart() }
        }
    }
}
