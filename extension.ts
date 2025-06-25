import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('projectPilot.start', () => {
    const panel = vscode.window.createWebviewPanel(
      'projectPilotAI',
      'ProjectPilotAI Session',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>ProjectPilotAI</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        h1 { color: #00bfa5; }
        button { margin: 10px 0; padding: 10px 20px; }
      </style>
    </head>
    <body>
      <h1>🚀 ProjectPilotAI</h1>
      <p>Welcome to your AI engineering copilot!</p>
      <button onclick="runCommand()">🧠 Summarize Code</button>
      <script>
        const vscode = acquireVsCodeApi();
        function runCommand() {
          vscode.postMessage({ type: 'summarizeCode' });
        }
      </script>
    </body>
    </html>
  `;
}
