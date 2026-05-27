import SwiftUI

struct ContentView: View {
    @StateObject private var vm = PhotoboothViewModel()

    var body: some View {
        Group {
            switch vm.currentScreen {
            case .welcome:
                WelcomeView(vm: vm)
            case .camera:
                CameraView(vm: vm)
            case .preview:
                PreviewView(vm: vm)
            case .payment:
                PaymentView(vm: vm)
            case .done:
                DoneView(vm: vm)
            }
        }
        .animation(.easeInOut(duration: 0.4), value: vm.currentScreen)
        .onOpenURL { url in
            // Handle SumUp callback: photobooth://payment?status=success&tx=...
            vm.handlePaymentCallback(url: url)
        }
    }
}
