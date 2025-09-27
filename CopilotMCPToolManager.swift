import Foundation

public extension Notification.Name {
    static let gitHubCopilotMCPToolsDidChange = Notification
        .Name("com.github.CopilotForXcode.CopilotMCPToolsDidChange")
}

public class CopilotMCPToolManager {
    private static var availableMCPServerTools: [MCPServerToolsCollection] = []
    
    public static func updateMCPTools(_ serverToolsCollections: [MCPServerToolsCollection]) {
        let sortedMCPServerTools = serverToolsCollections.sorted(by: { $0.name.lowercased() < $1.name.lowercased() })
        guard sortedMCPServerTools != availableMCPServerTools else { return }
        availableMCPServerTools = sortedMCPServerTools
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: .gitHubCopilotMCPToolsDidChange, object: nil)
        }
    }

    public static func getAvailableMCPTools() -> [MCPTool] {
        // Flatten all tools from all servers into a single array
        return availableMCPServerTools.flatMap { $0.tools }
    }
    
    public static func getAvailableMCPServerToolsCollections() -> [MCPServerToolsCollection] {
        return availableMCPServerTools
    }

    public static func hasMCPTools() -> Bool {
        return !availableMCPServerTools.isEmpty
    }

    public static func clearMCPTools() {
        availableMCPServerTools = []
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: .gitHubCopilotMCPToolsDidChange, object: nil)
        }
    }
}
