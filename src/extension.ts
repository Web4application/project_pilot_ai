import * as vscode from 'vscode';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('projectPilot.start', () => {
    const panel = vscode.window.createWebviewPanel(
      'projectPilotAI',
      'ProjectPilotAI',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(async (message) => {
      if (message.type === 'summarizeCode') {
        const editor = vscode.window.activeTextEditor;
        const code = editor?.document.getText(editor.selection) || '// No code selected';

        const response = await fetch('http://localhost:8000/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        const result = await response.text();
        panel.webview.postMessage({ type: 'result', text: result });
      }
    });
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return \`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>ProjectPilotAI</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        h1 { color: #00bfa5; }
        button { margin: 10px 0; padding: 10px 20px; }
        pre { background: #eee; padding: 10px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1>🚀 ProjectPilotAI</h1>
      <p>Select some code in the editor and click below:</p>
      <button onclick="summarize()">🧠 Summarize Code</button>
      <pre id="output"></pre>
      <script>
        const vscode = acquireVsCodeApi();
        function summarize() {
          vscode.postMessage({ type: 'summarizeCode' });
        }
        window.addEventListener('message', event => {
          const msg = event.data;
          if (msg.type === 'result') {
            document.getElementById('output').textContent = msg.text;
          }
        });
      </script>
    </body>
    </html>
  \`;
}
