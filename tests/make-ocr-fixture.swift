import AppKit
import PDFKit
let image = NSImage(size: NSSize(width: 1200, height: 600))
image.lockFocus()
NSColor.white.setFill()
NSRect(x: 0, y: 0, width: 1200, height: 600).fill()
let attributes: [NSAttributedString.Key: Any] = [.font: NSFont.systemFont(ofSize: 72), .foregroundColor: NSColor.black]
("TAKEVERA PRODUCTION TEST" as NSString).draw(at: NSPoint(x: 100, y: 300), withAttributes: attributes)
image.unlockFocus()
let document = PDFDocument()
guard let page = PDFPage(image: image) else { fatalError("Unable to generate test page") }
document.insert(page, at: 0)
if !document.write(to: URL(fileURLWithPath: CommandLine.arguments[1])) { fatalError("Unable to write test PDF") }
