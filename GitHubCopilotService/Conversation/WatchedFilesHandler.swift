import JSONRPC
import Combine
import Workspace
import XcodeInspector
import Foundation

public protocol WatchedFilesHandler {
    var onWatchedFiles: PassthroughSubject<(WatchedFilesRequest, (AnyJSONRPCResponse) -> Void), Never> { get }
    func handleWatchedFiles(_ request: WatchedFilesRequest, workspaceURL: URL, completion: @escaping (AnyJSONRPCResponse) -> Void, service: GitHubCopilotService?)
}

public final class WatchedFilesHandlerImpl: WatchedFilesHandler {
    public static let shared = WatchedFilesHandlerImpl()
    
    public let onWatchedFiles: PassthroughSubject<(WatchedFilesRequest, (AnyJSONRPCResponse) -> Void), Never> = .init()
    
    public func handleWatchedFiles(_ request: WatchedFilesRequest, workspaceURL: URL, completion: @escaping (AnyJSONRPCResponse) -> Void, service: GitHubCopilotService?) {
        guard let params = request.params, params.workspaceFolder.uri != "/" else { return }

        let projectURL = WorkspaceXcodeWindowInspector.extractProjectURL(workspaceURL: workspaceURL, documentURL: nil) ?? workspaceURL
        
        let files = WorkspaceFile.getWatchedFiles(
            workspaceURL: workspaceURL,
            projectURL: projectURL,
            excludeGitIgnoredFiles: params.excludeGitignoredFiles,
            excludeIDEIgnoredFiles: params.excludeIDEIgnoredFiles
        ).prefix(10000) // Set max number of indexing file to 10000
        
        let batchSize = BatchingFileChangeWatcher.maxEventPublishSize
        /// only `batchSize`(100) files to complete this event for setup watching workspace in CLS side
        let jsonResult: JSONValue = .array(files.prefix(batchSize).map { .hash(["uri": .string($0)]) })
        let jsonValue: JSONValue = .hash(["files": jsonResult])
        
        completion(AnyJSONRPCResponse(id: request.id, result: jsonValue))
        
        Task {
            if files.count > batchSize {
                for startIndex in stride(from: batchSize, to: files.count, by: batchSize) {
                    let endIndex = min(startIndex + batchSize, files.count)
                    let batch = Array(files[startIndex..<endIndex])
                    try? await service?.notifyDidChangeWatchedFiles(.init(
                        workspaceUri: params.workspaceFolder.uri,
                        changes: batch.map { .init(uri: $0, type: .created)}
                    ))
                    
                    try? await Task.sleep(nanoseconds: 100_000_000)  // 100ms
                }
            }
        }
        
        /// publish event for watching workspace file changes
        onWatchedFiles.send((request, completion))
    }
}

