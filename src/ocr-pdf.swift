import AppKit
import Foundation
import PDFKit
import Vision

let arguments = CommandLine.arguments
if arguments.count != 3 {
    fputs("Usage: ocr-pdf.swift <pdf-path> <zero-based-page-indices>\n", stderr)
    exit(2)
}
let pdfURL = URL(fileURLWithPath: arguments[1])
let pageIndices = arguments[2].split(separator: ",").compactMap { Int($0) }
guard let document = PDFDocument(url: pdfURL) else {
    fputs("Could not open PDF with PDFKit\n", stderr)
    exit(3)
}
var output: [String: String] = [:]
for index in pageIndices {
    guard index >= 0, index < document.pageCount, let page = document.page(at: index) else { continue }
    let image = page.thumbnail(of: CGSize(width: 1800, height: 2400), for: .mediaBox)
    var bounds = CGRect(origin: .zero, size: image.size)
    guard let cgImage = image.cgImage(forProposedRect: &bounds, context: nil, hints: nil) else { continue }
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    request.automaticallyDetectsLanguage = true
    do {
        try VNImageRequestHandler(cgImage: cgImage).perform([request])
        output[String(index)] = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
    } catch {
        fputs("Vision OCR failed on page \(index + 1): \(error.localizedDescription)\n", stderr)
        output[String(index)] = ""
    }
}
let data = try JSONSerialization.data(withJSONObject: ["pages": output], options: [.sortedKeys])
FileHandle.standardOutput.write(data)
