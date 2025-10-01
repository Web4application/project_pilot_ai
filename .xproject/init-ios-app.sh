#!/bin/bash
set -e

APP_NAME="projectpilotAI"
BUNDLE_ID="com.web4application.projectpilotAI"
IOS_VERSION="26.1.0"

echo "🚀 Initializing iOS App Project: $projectpilotAI"

# Create directory for the app
mkdir -p $projectpilotAI
cd $projectpilotAI

# Create a minimal SwiftUI App with AppDelegate
cat > ContentView.swift <<EOF
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Hello, projectpilotAI 👋")
            .font(.largeTitle)
            .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
EOF

cat > ${projectpilotAI}App.swift <<EOF
import SwiftUI

@main
struct ${projectpilotAI}App: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
EOF

# Initialize new Xcode project
cat > project.pbxproj <<EOF
// This is a placeholder — normally Xcode generates this file.
// After running this script, open Xcode and it will complete setup.
EOF

# Go back to repo root
cd ..

# Generate an .xcodeproj using SwiftPM
swift package generate-xcodeproj

echo "✅ iOS App project skeleton created."
echo "👉 Next: open Xcode with 'open RodaAI.xcodeproj' and add the iOS target."
