import UIKit

/// Bouwt een fotostrip van meerdere foto's — volledig UIKit, iOS 12 compatibel.
struct PhotoStripService {

    struct StripConfig {
        var backgroundColor: UIColor = .black
        var padding: CGFloat         = 20
        var photoSpacing: CGFloat    = 12
        var photoWidth: CGFloat      = 600
        var photoAspectRatio: CGFloat = 4.0 / 3.0
        var footerHeight: CGFloat    = 80
        var footerText: String       = AppConfig.stripFooterText
        var footerFont: UIFont       = .systemFont(ofSize: 28, weight: .light)
        var footerColor: UIColor     = .white
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

        // Achtergrond
        config.backgroundColor.setFill()
        ctx.fill(CGRect(origin: .zero, size: canvasSize))

        // Foto's
        for (index, photo) in photos.enumerated() {
            let y = config.padding + CGFloat(index) * (photoHeight + config.photoSpacing)
            let rect = CGRect(x: config.padding, y: y,
                              width: config.photoWidth, height: photoHeight)
            let path = UIBezierPath(roundedRect: rect, cornerRadius: 8)
            ctx.saveGState()
            path.addClip()
            drawAspectFill(photo, in: rect)
            ctx.restoreGState()
        }

        // Footer
        let footerY = totalHeight - config.footerHeight - config.padding / 2
        let footerRect = CGRect(x: config.padding, y: footerY,
                                width: config.photoWidth, height: config.footerHeight)
        let style = NSMutableParagraphStyle()
        style.alignment = .center
        config.footerText.draw(in: footerRect, withAttributes: [
            .font: config.footerFont,
            .foregroundColor: config.footerColor,
            .paragraphStyle: style,
        ])

        return UIGraphicsGetImageFromCurrentImageContext()
    }

    private static func drawAspectFill(_ image: UIImage, in rect: CGRect) {
        let s = image.size
        let scale = max(rect.width / s.width, rect.height / s.height)
        let w = s.width * scale, h = s.height * scale
        let x = rect.minX + (rect.width - w) / 2
        let y = rect.minY + (rect.height - h) / 2
        image.draw(in: CGRect(x: x, y: y, width: w, height: h))
    }
}
