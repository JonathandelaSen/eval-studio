import Foundation
import FoundationModels

struct Request: Decodable {
    let mode: String
    let instructions: String?
    let prompt: String?
    let temperature: Double?
}

struct Reply: Encodable {
    var available: Bool?
    var reason: String?
    var model: String?
    var systemVersion: String?
    var output: String?
}

func emit(_ reply: Reply) throws {
    let data = try JSONEncoder().encode(reply)
    FileHandle.standardOutput.write(data)
}

let request = try JSONDecoder().decode(Request.self, from: FileHandle.standardInput.readDataToEndOfFile())
let model = SystemLanguageModel.default
let version = ProcessInfo.processInfo.operatingSystemVersionString

if request.mode == "availability" {
    switch model.availability {
    case .available:
        try emit(Reply(available: true, model: "system-default", systemVersion: version))
    case .unavailable(let reason):
        try emit(Reply(available: false, reason: String(describing: reason), model: "system-default", systemVersion: version))
    }
} else {
    guard case .available = model.availability else {
        throw NSError(domain: "EvalStudio", code: 1, userInfo: [NSLocalizedDescriptionKey: "Apple system model is unavailable."])
    }
    let session = LanguageModelSession(model: model, instructions: request.instructions ?? "")
    let options = GenerationOptions(temperature: request.temperature)
    let response = try await session.respond(to: request.prompt ?? "", options: options)
    try emit(Reply(model: "system-default", systemVersion: version, output: response.content))
}
