import UIKit

/// Builds a 4-photo strip image from an array of photos
struct PhotoStripService {

    struct StripConfig {
        var backgroundColor: UIColor = .black
        var padding: CGFloat = 20
        var photoSpacing: CGFloat = 12
        var photoWidth: CGFloat = 600
        var photoAspectRatio: CGFloat = 4.0 / 3.0   // portrait
        var footerHeight: CGFloat = 80
        var footerText: String = "Photobooth ✦ 2026"
        var footerFont: UIFont = .systemFont(ofSize: 28, weight: .light)
        var footerColor: UIColor = .white
    }

    static func buildStrip(from photos: [UIImage],
                            config: StripConfig = .init()) -> UIImage? {
        guard !photos.isEmpty else { return nil }

        let photoHeight = config.photoWidth / config.photoAspectRatio
        let totalHeight = config.padding
            + CGFloat(photos.count) * photoHeight
            + CGFloat(photos.count - 1) * config.photoSpacing
            + config.footerHeight
            + config.padding

        let canvasSize = CGSize(width: config.photoWidth + config.padding * 2,
                                height: totalHeight)

        UIGraphicsBeginImageContextWithOptions(canvasSize, true, 0)
        defer { UIGraphicsEndImageContext() }

        guard let ctx = UIGraphicsGetCurrentContext() else { return nil }

        // Background
        config.backgroundColor.setFill()
        ctx.fill(CGRect(origin: .zero, size: canvasSize))

        // Photos
        for (index, photo) in photos.enumerated() {
            let y = config.padding + CGFloat(index) * (photoHeight + config.photoSpacing)
            let rect = CGRect(x: config.padding, y: y,
                              width: config.photoWidth, height: photoHeight)

            // Clip to rounded rect
            let path = UIBezierPath(roundedRect: rect, cornerRadius: 8)
            ctx.saveGState()
            path.addClip()
            drawImageAspectFill(photo, in: rect)
            ctx.restoreGState()
        }

        // Footer text
        let footerY = totalHeight - config.footerHeight - config.padding / 2
        let footerRect = CGRect(x: config.padding, y: footerY,
                                width: config.photoWidth, height: config.footerHeight)

        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.alignment = .center

        let attrs: [NSAttributedString.Key: Any] = [
            .font: config.footerFont,
            .foregroundColor: config.footerColor,
            .paragraphStyle: paragraphStyle,
        ]
        config.footerText.draw(in: footerRect, withAttributes: attrs)

        return UIGraphicsGetImageFromCurrentImageContext()
    }

    private static func drawImageAspectFill(_ image: UIImage, in rect: CGRect) {
        let imageSize = image.size
        let scale = max(rect.width / imageSize.width, rect.height / imageSize.height)
        let scaledWidth = imageSize.width * scale
        let scaledHeight = imageSize.height * scale
        let drawX = rect.minX + (rect.width - scaledWidth) / 2
        let drawY = rect.minY + (rect.height - scaledHeight) / 2
        image.draw(in: CGRect(x: drawX, y: drawY, width: scaledWidth, height: scaledHeight))
    }
}
