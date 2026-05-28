import SwiftUI

struct PaymentView: View {
    @ObservedObject var vm: PhotoboothViewModel
    @State private var waitingForCallback = false

    var body: some View {
        ZStack {
            Color(hex: "1a1a2e").ignoresSafeArea()

            VStack(spacing: 40) {
                Spacer()

                // Icon
                Image(systemName: "creditcard")
                    .font(.system(size: 80, weight: .ultraLight))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Color(hex: "e94560"), Color(hex: "f5a623")],
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        )
                    )

                VStack(spacing: 12) {
                    Text("Betaling")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text("€\(String(format: "%.2f", vm.price))")
                        .font(.system(size: 72, weight: .black, design: .rounded))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color(hex: "e94560"), Color(hex: "f5a623")],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                }

                if waitingForCallback {
                    VStack(spacing: 16) {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)
                        Text("Wachten op betaalbevestiging…")
                            .font(.system(size: 18))
                            .foregroundColor(.white.opacity(0.6))
                    }
                    .padding(.vertical, 20)
                }

                // Failed state
                if vm.session.paymentStatus == .failed {
                    Label("Betaling mislukt. Probeer opnieuw.", systemImage: "exclamationmark.triangle.fill")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(Color(hex: "e94560"))
                        .padding()
                        .background(Color(hex: "e94560").opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Spacer()

                VStack(spacing: 16) {
                    Button(action: {
                        waitingForCallback = true
                        vm.openSumUp()
                    }) {
                        Label("Betalen met SumUp", systemImage: "arrow.up.right.square.fill")
                            .font(.system(size: 26, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 26)
                            .background(
                                LinearGradient(
                                    colors: [Color(hex: "e94560"), Color(hex: "c0392b")],
                                    startPoint: .leading, endPoint: .trailing
                                )
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 18))
                    }

                    Button(action: { vm.goToPreview() }) {
                        Label("Terug naar preview", systemImage: "chevron.left")
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.horizontal, 50)
                .padding(.bottom, 50)
            }
        }
        .onChange(of: vm.session.paymentStatus) { status in
            if status != .pending { waitingForCallback = false }
        }
    }
}
