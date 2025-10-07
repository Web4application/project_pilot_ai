# 🧠 ProjectPilotAI

**ProjectPilotAI** is an AI-powered developer assistant that understands, analyzes, documents, and improves your codebase. It leverages cutting-edge large language models (LLMs), real-time file monitoring, GitHub integrations, and voice input to act as your second brain for software development.

## 🚀 Features

### 🔍 AI Codebase Analysis
- Summarize entire repositories with GPT-4
- Understand unfamiliar codebases in seconds

### ✨ Intelligent Refactoring (Pluggable)
- Catch smells, anti-patterns, and suggest best practices
- Hooks for custom GPT prompts and code transformation

### 🛠 Real-Time Dev Watchdog
- Monitor file changes
- Instantly suggest improvements or generate docs on file save

### 🤖 PR Review Bot (GitHub Actions)
- Automatically reviews pull requests
- Flags risky changes and suggests fixes using AI

### 📄 Auto-Documentation Generator
- Create or update `README.md`, module docstrings, and architecture maps

### 🧪 Security Scanner
- Detect `eval()`, insecure file access, missing `with` blocks, and more
- Pluggable AST-based Python linter

### 🔈 Voice Command & TTS
- Use Whisper to transcribe voice to code
- Hear summaries, file info, or project status aloud via TTS

### 💡 Natural Language Project Generator
- “Create a Flask API with Docker and tests” → Done.
- Fully code-generative workflow with AI chain of thought

### 🧰 VS Code Extension (WIP)
- Interact directly with the assistant from VS Code
- Generate functions, review diffs, or refactor selected code

### 🎨 Figma to Code Converter
- Converts Figma JSON into component code
- Useful for front-end engineers and designers

### 🌐 Streamlit Deploy UI
- Run the entire system from a sleek web GUI
- Upload a project, analyze, refactor, or summarize with one click

## 🧱 Architecture

```
project_pilot_ai/
├── ai_core/
├── cli/
├── gui/
├── integrations/
├── pilot_sdk/
├── voice/
├── .github/
└── vscode-plugin/
```

## 📜 License
MIT License © 2025 Web4application

![demo_link](https://github.com/user-attachments/assets/29b83d6b-2f1b-4da4-b5a2-2d5eec6c215e)
