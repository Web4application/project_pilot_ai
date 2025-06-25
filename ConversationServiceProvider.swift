import CopilotForXcodeKit
import Foundation
import CodableWrappers
import LanguageServerProtocol

public protocol ConversationServiceType {
    func createConversation(_ request: ConversationRequest, workspace: WorkspaceInfo) async throws
    func createTurn(with conversationId: String, request: ConversationRequest, workspace: WorkspaceInfo) async throws
    func cancelProgress(_ workDoneToken: String, workspace: WorkspaceInfo) async throws
    func rateConversation(turnId: String, rating: ConversationRating, workspace: WorkspaceInfo) async throws
    func copyCode(request: CopyCodeRequest, workspace: WorkspaceInfo) async throws
    func templates(workspace: WorkspaceInfo) async throws -> [ChatTemplate]?
    func models(workspace: WorkspaceInfo) async throws -> [CopilotModel]?
    func notifyDidChangeWatchedFiles(_ event: DidChangeWatchedFilesEvent, workspace: WorkspaceInfo) async throws
    func agents(workspace: WorkspaceInfo) async throws -> [ChatAgent]?
}

public protocol ConversationServiceProvider {
    func createConversation(_ request: ConversationRequest, workspaceURL: URL?) async throws
    func createTurn(with conversationId: String, request: ConversationRequest, workspaceURL: URL?) async throws
    func stopReceivingMessage(_ workDoneToken: String, workspaceURL: URL?) async throws
    func rateConversation(turnId: String, rating: ConversationRating, workspaceURL: URL?) async throws
    func copyCode(_ request: CopyCodeRequest, workspaceURL: URL?) async throws
    func templates() async throws -> [ChatTemplate]?
    func models() async throws -> [CopilotModel]?
    func notifyDidChangeWatchedFiles(_ event: DidChangeWatchedFilesEvent, workspace: WorkspaceInfo) async throws
    func agents() async throws -> [ChatAgent]?
}

public struct FileReference: Hashable, Codable, Equatable {
    public let url: URL
    public let relativePath: String?
    public let fileName: String?
    public var isCurrentEditor: Bool = false

    public init(url: URL, relativePath: String?, fileName: String?, isCurrentEditor: Bool = false) {
        self.url = url
        self.relativePath = relativePath
        self.fileName = fileName
        self.isCurrentEditor = isCurrentEditor
    }
    
    public init(url: URL, isCurrentEditor: Bool = false) {
        self.url = url
        self.relativePath = nil
        self.fileName = nil
        self.isCurrentEditor = isCurrentEditor
    }
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(url)
        hasher.combine(isCurrentEditor)
    }

    public static func == (lhs: FileReference, rhs: FileReference) -> Bool {
        return lhs.url == rhs.url && lhs.isCurrentEditor == rhs.isCurrentEditor
    }
}

extension FileReference {
    public func getPathRelativeToHome() -> String {
        let filePath = url.path
        guard !filePath.isEmpty else { return "" }
        
        let homeDirectory = FileManager.default.homeDirectoryForCurrentUser.path
        if !homeDirectory.isEmpty {
            return filePath.replacingOccurrences(of: homeDirectory, with: "~")
        }
        
        return filePath
    }
}

public struct TurnSchema: Codable {
    public var request: String
    public var response: String?
    public var agentSlug: String?
    public var turnId: String?
    
    public init(request: String, response: String? = nil, agentSlug: String? = nil, turnId: String? = nil) {
        self.request = request
        self.response = response
        self.agentSlug = agentSlug
        self.turnId = turnId
    }
}

public struct ConversationRequest {
    public var workDoneToken: String
    public var content: String
    public var workspaceFolder: String
    public var activeDoc: Doc?
    public var skills: [String]
    public var ignoredSkills: [String]?
    public var references: [FileReference]?
    public var model: String?
    public var turns: [TurnSchema]
    public var agentMode: Bool = false
    public var userLanguage: String? = nil
    public var turnId: String? = nil

    public init(
        workDoneToken: String,
        content: String,
        workspaceFolder: String,
        activeDoc: Doc? = nil,
        skills: [String],
        ignoredSkills: [String]? = nil,
        references: [FileReference]? = nil,
        model: String? = nil,
        turns: [TurnSchema] = [],
        agentMode: Bool = false,
        userLanguage: String?,
        turnId: String? = nil
    ) {
        self.workDoneToken = workDoneToken
        self.content = content
        self.workspaceFolder = workspaceFolder
        self.activeDoc = activeDoc
        self.skills = skills
        self.ignoredSkills = ignoredSkills
        self.references = references
        self.model = model
        self.turns = turns
        self.agentMode = agentMode
        self.userLanguage = userLanguage
        self.turnId = turnId
    }
}

public struct CopyCodeRequest {
    public var turnId: String
    public var codeBlockIndex: Int
    public var copyType: CopyKind
    public var copiedCharacters: Int
    public var totalCharacters: Int
    public var copiedText: String
    
    init(turnId: String, codeBlockIndex: Int, copyType: CopyKind, copiedCharacters: Int, totalCharacters: Int, copiedText: String) {
        self.turnId = turnId
        self.codeBlockIndex = codeBlockIndex
        self.copyType = copyType
        self.copiedCharacters = copiedCharacters
        self.totalCharacters = totalCharacters
        self.copiedText = copiedText
    }
}

public enum ConversationRating: Int, Codable {
    case unrated = 0
    case helpful = 1
    case unhelpful = -1
}

public enum CopyKind: Int, Codable {
    case keyboard = 1
    case toolbar = 2
}


public struct ConversationFollowUp: Codable, Equatable {
    public var message: String
    public var id: String
    public var type: String
    
    public init(message: String, id: String, type: String) {
        self.message = message
        self.id = id
        self.type = type
    }
}

public struct ConversationProgressStep: Codable, Equatable, Identifiable {
    public enum StepStatus: String, Codable {
        case running, completed, failed, cancelled
    }
    
    public struct StepError: Codable, Equatable {
        public let message: String
    }
    
    public let id: String
    public let title: String
    public let description: String?
    public var status: StepStatus
    public let error: StepError?
    
    public init(id: String, title: String, description: String?, status: StepStatus, error: StepError?) {
        self.id = id
        self.title = title
        self.description = description
        self.status = status
        self.error = error
    }
}

public struct DidChangeWatchedFilesEvent: Codable {
    public var workspaceUri: String
    public var changes: [FileEvent]
    
    public init(workspaceUri: String, changes: [FileEvent]) {
        self.workspaceUri = workspaceUri
        self.changes = changes
    }
}

public struct AgentRound: Codable, Equatable {
    public let roundId: Int
    public var reply: String
    public var toolCalls: [AgentToolCall]?
    
    public init(roundId: Int, reply: String, toolCalls: [AgentToolCall]? = []) {
        self.roundId = roundId
        self.reply = reply
        self.toolCalls = toolCalls
    }
}

public struct AgentToolCall: Codable, Equatable, Identifiable {
    public let id: String
    public let name: String
    public var progressMessage: String?
    public var status: ToolCallStatus
    public var error: String?
    public var invokeParams: InvokeClientToolParams?
    
    public enum ToolCallStatus: String, Codable {
        case waitForConfirmation, accepted, running, completed, error, cancelled
    }

    public init(id: String, name: String, progressMessage: String? = nil, status: ToolCallStatus, error: String? = nil, invokeParams: InvokeClientToolParams? = nil) {
        self.id = id
        self.name = name
        self.progressMessage = progressMessage
        self.status = status
        self.error = error
        self.invokeParams = invokeParams
    }
}
