import Foundation
import JSONRPC
import LanguageServerProtocol

public struct MessageActionItem: Codable, Hashable {
    public var title: String
}

public struct ShowMessageRequestParams: Codable, Hashable {
    public var type: MessageType
    public var message: String
    public var actions: [MessageActionItem]?
}

extension ShowMessageRequestParams: CustomStringConvertible {
    public var description: String {
        return "\(type): \(message)"
    }
}

public typealias ShowMessageRequestResponse = MessageActionItem?

public typealias ShowMessageRequest = JSONRPCRequest<ShowMessageRequestParams>
