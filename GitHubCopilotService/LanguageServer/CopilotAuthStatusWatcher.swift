import Foundation

class CopilotAuthStatusWatcher {
    static let pollInterval: TimeInterval = 30
    private var timer: Timer?

    public init(_ service: GitHubCopilotService) {
        Task { @MainActor in
            self.timer = Timer.scheduledTimer(withTimeInterval: Self.pollInterval, repeats: true) { [weak service] _ in
                service?.updateStatusInBackground()
            }
        }
    }

    deinit {
        let t = timer
        Task { @MainActor in
            t?.invalidate()
        }
    }
}
