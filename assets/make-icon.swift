import AppKit
import Foundation

// Run from the project root. The source is also used in the app sidebar.
let source = URL(fileURLWithPath: "src/assets/takevera-logo.png")
let output = CommandLine.arguments.dropFirst().first ?? "/tmp/takevera-icon.png"
guard let image = NSImage(contentsOf: source),
      let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 1024, pixelsHigh: 1024,
          bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
          colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0),
      let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
    fatalError("Could not load or render the Takevera logo")
}
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.imageInterpolation = .high
image.draw(in: NSRect(x: 0, y: 0, width: 1024, height: 1024))
context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()
guard let png = bitmap.representation(using: .png, properties: [:]) else {
    fatalError("Could not encode the Takevera logo")
}
try png.write(to: URL(fileURLWithPath: output), options: .atomic)
