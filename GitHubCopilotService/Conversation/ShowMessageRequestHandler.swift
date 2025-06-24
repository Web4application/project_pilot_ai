import JSONRPC
import Combine

public protocol ShowMessageRequestHandler {
    var onShowMessage: PassthroughSubject<(ShowMessageRequest, (AnyJSONRPCResponse) -> Void), Never> { get }
    func handleShowMessage(
        _ request: ShowMessageRequest,
        completion: @escaping (
            AnyJSONRPCResponse
        ) -> Void
    )
}

public final class ShowMessageRequestHandlerImpl: ShowMessageRequestHandler {
    public static let shared = ShowMessageRequestHandlerImpl()
    
    public let onShowMessage: PassthroughSubject<(ShowMessageRequest, (AnyJSONRPCResponse) -> Void), Never> = .init()

    public func handleShowMessage(_ request: ShowMessageRequest, completion: @escaping (AnyJSONRPCResponse) -> Void) {
        onShowMessage.send((request, completion))
    }
}
