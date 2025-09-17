#!/bin/bash
# Generate an Xcode project for roda-ai

# Exit immediately if a command fails
set -e

# Project name
PROJECT_NAME="RodaAI"

# Create directories
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Create Sources and Tests folders
mkdir -p Sources/$PROJECT_NAME
mkdir -p Tests/$PROJECT_NAMETests

# Add a Swift file
cat > Sources/$PROJECT_NAME/main.swift <<EOL
import Foundation

print("Hello, Roda AI running in Xcode!")
EOL

# Add a test file
cat > Tests/$PROJECT_NAMETests/TestExample.swift <<EOL
import XCTest
@testable import $PROJECT_NAME

final class ${PROJECT_NAME}Tests: XCTestCase {
    func testExample() throws {
        XCTAssertEqual(2 + 2, 4)
    }
}
EOL

# Initialize Swift package
swift package init --type executable --name $PROJECT_NAME

# Generate Xcode project
swift package generate-xcodeproj

echo "✅ Xcode project generated: $PROJECT_NAME.xcodeproj"
