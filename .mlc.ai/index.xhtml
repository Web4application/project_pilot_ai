<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AI Code Analyzer – WebLLM</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 2rem;
      background-color: #2f3136;
      color: #dcddde;
    }
    h1 {
      color: #ffffff;
    }
    textarea {
      width: 100%;
      height: 220px;
      background-color: #40444b;
      border: none;
      border-radius: 8px;
      color: #dcddde;
      padding: 12px;
      font-size: 14px;
    }
    button {
      margin: 0.5rem;
      padding: 0.6rem 1.2rem;
      font-weight: bold;
      cursor: pointer;
      border: none;
      border-radius: 6px;
      background-color: #5865f2;
      color: white;
    }
    button:hover {
      background-color: #4752c4;
    }
    #taskStatus {
      margin-top: 1rem;
      font-size: 14px;
    }
    pre {
      margin-top: 1rem;
      padding: 12px;
      background-color: #23272a;
      border-radius: 8px;
      color: #00ffcc;
      white-space: pre-wrap;
    }
  </style>

  <!-- ✅ Official WebLLM JS -->
  <script src="https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@latest/dist/index.min.js"></script>
</head>
<body>

  <h1>🧠 AI Code Analyzer (WebLLM)</h1>
  <div id="taskStatus">Loading model... please wait</div>
  <textarea id="inputCode" placeholder="Paste your code here..."></textarea><br>

  <button onclick="runTask()">Run Analysis</button>
  <button onclick="saveResult()">Save Result</button>
  <button onclick="redo()">Redo</button>
  <button onclick="goBack()">Back</button>

  <pre id="resultBox">Waiting for analysis...</pre>

  <script>
    let engine, lastResult = '';

    // Generate filename helper
    function generateFilename(prefix) {
      const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');
      return `${prefix}_${timestamp}`;
    }

    // Load WebLLM model
    async function loadModel() {
      try {
        document.getElementById('taskStatus').textContent = 'Initializing WebLLM engine...';
        engine = await webllm.CreateMLCEngine("Llama-3-8B-Instruct-q4f32_1", {
          initProgressCallback: (progress) => {
            document.getElementById('taskStatus').textContent =
              `Loading model... ${(progress.progress * 100).toFixed(1)}%`;
          }
        });
        document.getElementById('taskStatus').textContent = '✅ Model loaded! Ready to analyze.';
      } catch (err) {
        console.error(err);
        document.getElementById('taskStatus').textContent = '❌ Failed to load model.';
      }
    }

    // Run analysis
    async function runTask() {
      const code = document.getElementById('inputCode').value.trim();
      if (!code) {
        alert('Please paste your code first.');
        return;
      }
      if (!engine) await loadModel();

      document.getElementById('taskStatus').textContent = 'Analyzing your code... please wait.';

      const prompt = `
      You are an expert AI code analyzer.
      Analyze the following code and explain:
      - What it does
      - Possible bugs or logic issues
      - Improvements and optimizations
      - Security or performance risks

      Code:
      ${code}

      Provide your analysis below:
      `;

      try {
        const reply = await engine.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 400
        });
        lastResult = reply.choices[0].message.content.trim();
        document.getElementById('resultBox').textContent = lastResult;
        document.getElementById('taskStatus').textContent = '✅ Analysis complete!';
      } catch (err) {
        console.error(err);
        document.getElementById('taskStatus').textContent = '❌ Error running analysis.';
      }
    }

    // Save to localStorage
    function saveResult() {
      if (!lastResult) return alert('No result to save yet.');
      const key = generateFilename('analysis');
      localStorage.setItem(key, lastResult);
      alert(`Saved as "${key}" in localStorage.`);
    }

    // Redo last
    function redo() {
      if (!lastResult) return alert('No previous result found.');
      document.getElementById('inputCode').value = lastResult;
      runTask();
    }

    // Back navigation
    function goBack() {
      window.location.href = 'index.html';
    }

    // Auto-load model on start
    loadModel();
  </script>

</body>
</html>
