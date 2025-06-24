import LanguageServerProtocol

public enum CLSErrorCode: Int {
    // defined by JSON-RPC
    case parseError = -32700
    case invalidRequest = -32600
    case methodNotFound = -32601
    case invalidParams = -32602
    case internalError = -32603

    // defined by LSP (see https://microsoft.github.io/language-server-protocol/specification/#responseMessage)
    case serverNotInitialized = -32002
    case requestFailed = -32803;
    case serverCancelled = -32802;
    case contentModified = -32801;
    case requestCancelled = -32800;

    // used by the Copilot Language Server
    case noCopilotToken = 1000
    case deviceFlowFailed = 1001
    case copilotNotAvailable = 1002
}

public struct CLSErrorInfo {
    public let code: Int
    public let message: String
    public let data: Codable?

    public init?(for error: ServerError) {
        if case .serverError(let code, let message, let data) = error {
            self.code = code
            self.message = message
            self.data = data
        } else {
            return nil
        }
    }

    public var clsErrorCode: CLSErrorCode? {
        CLSErrorCode(rawValue: code)
    }

    public var affectsAuthStatus: Bool {
        clsErrorCode == CLSErrorCode.noCopilotToken
    }
}
