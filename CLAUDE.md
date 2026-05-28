# Photobooth – Native iOS App

Zelfgebouwde kiosk-photobooth voor iPad mini met Canon SELPHY CP1500 printer en SumUp betaalterminal. Gebouwd als **native SwiftUI app** (iOS 17+, Swift 6).

## Hardware

| Apparaat | Details |
|---|---|
| iPad mini (A17 Pro) | Draait de app als kiosk via Guided Access |
| Canon SELPHY CP1500 | Dye-sub fotoprinter, verbonden via AirPrint (WiFi) |
| SumUp Air / Solo | Betaalterminal, gekoppeld via iOS URL scheme |

## Projectstructuur

```
photobooth/
├── .github/workflows/ci.yml      # GitHub Actions: build → test → archive
├── Photobooth/
│   ├── project.yml               # xcodegen config (source of truth voor .xcodeproj)
│   ├── Photobooth/               # App source
│   │   ├── PhotoboothApp.swift
│   │   ├── Models/
│   │   │   └── PhotoboothSession.swift
│   │   ├── ViewModels/
│   │   │   └── PhotoboothViewModel.swift
│   │   ├── Views/
│   │   │   ├── ContentView.swift
│   │   │   ├── WelcomeView.swift
│   │   │   ├── CameraView.swift
│   │   │   ├── CameraPreviewView.swift
│   │   │   ├── PreviewView.swift
│   │   │   ├── PaymentView.swift
│   │   │   └── DoneView.swift
│   │   ├── Services/
│   │   │   ├── CameraService.swift      # AVFoundation camera
│   │   │   └── PhotoStripService.swift  # Canvas strip rendering
│   │   └── Utils/
│   │       ├── AppConfig.swift          # Alle config via Info.plist / xcconfig
│   │       ├── Color+Hex.swift
│   │       └── HapticFeedback.swift
│   ├── PhotoboothTests/           # Unit tests (XCTest)
│   └── PhotoboothUITests/         # UI tests (XCUITest)
└── CLAUDE.md
```

## Lokaal bouwen

```bash
# 1. Genereer het Xcode-project vanuit project.yml
cd Photobooth && xcodegen generate

# 2. Open in Xcode
open Photobooth.xcodeproj

# 3. Tests draaien (simulator)
xcodebuild test \
  -project Photobooth.xcodeproj \
  -scheme Photobooth \
  -destination "platform=iOS Simulator,name=iPad mini (A17 Pro),OS=latest" \
  CODE_SIGNING_ALLOWED=NO
```

> ⚠️ Commit nooit `Photobooth.xcodeproj` — dit wordt gegenereerd door xcodegen. Staat in `.gitignore`.

## Configuratie (productie)

Maak een `Photobooth/Local.xcconfig` (staat in `.gitignore`):

```
SUMUP_AFFILIATE_KEY = jouw_echte_key_hier
PHOTOBOOTH_PRICE = 3.00
```

Of stel in als Xcode scheme environment variable tijdens ontwikkeling.

In CI worden deze meegegeven als GitHub Actions secrets:
- `SUMUP_AFFILIATE_KEY`
- `PHOTOBOOTH_PRICE`

## SumUp integratie

- URL scheme: `sumupmerchant://pay/1.0?affiliate-key=...`
- Callback terug naar app via: `photobooth://payment?status=success`
- Affiliate key aanvragen: https://developer.sumup.com

## Kiosk-modus (productie)

1. Installeer de app via Xcode of TestFlight
2. Start de app
3. Activeer **Guided Access**: druk 3× op de zijknop
4. Stel automatisch vergrendelen in op **Nooit**
5. Sluit iPad aan op lader

## CI/CD (GitHub Actions)

| Job | Trigger | Wat |
|---|---|---|
| Build | push/PR | Compileer Debug |
| Unit Tests | na build | XCTest unit tests + coverage |
| UI Tests | na build | XCUITest op iPad simulator |
| Archive | push naar main | Release archive (.xcarchive) |

## Nog te doen

- [ ] SumUp affiliate key invullen (`Local.xcconfig`)
- [ ] Apple Developer Team ID invullen in `project.yml`
- [ ] App testen op echte iPad mini
- [ ] Canon SELPHY verbinden en AirPrint testen
- [ ] App icon ontwerpen (1024×1024 px)
- [ ] GitHub Secrets instellen (`SUMUP_AFFILIATE_KEY`, `PHOTOBOOTH_PRICE`)
