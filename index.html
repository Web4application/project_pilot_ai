<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>🧠 ProjectPilotAI v3.5</title>
  <link rel="stylesheet" href="style.css" />
  <script type="module" src="https://mlc.ai/web-llm/dist/index.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script src="https://unpkg.com/html2pdf.js/dist/html2pdf.bundle.min.js"></script>
  <link rel="manifest" href="manifest.json">
  <script src="service-worker.js"></script>
  <style>
    body {
      background: #121212;
      color: #fff;
      font-family: monospace;
      padding: 2rem;
    }
    .tabs {
      display: flex;
      gap: 1rem;
      margin: 2rem 0 1rem;
    }
    .tab {
      padding: 1rem;
      background: #1e1e1e;
      cursor: pointer;
    }
    .tab.active {
      background: #00ff90;
      color: black;
    }
    .view {
      display: none;
    }
    .view.active {
      display: block;
    }
    textarea, pre {
      width: 100%;
      padding: 1rem;
      background: #1e1e1e;
      color: #00ff90;
      border: 1px solid #444;
      white-space: pre-wrap;
      margin-top: 1rem;
    }
    button {
      padding: 1rem;
      background: #00ff90;
      border: none;
      margin: 1rem 0;
      font-size: 1rem;
      cursor: pointer;
    }
    #fileTree div {
      cursor: pointer;
      margin: 4px 0;
    }
    #fileTree div:hover {
      background: #222;
    }
    input[type="text"] {
      width: 60%;
      padding: 0.5rem;
      font-size: 1rem;
      background: #1e1e1e;
      color: #00ff90;
      border: 1px solid #444;
      margin: 1rem 0;
    }
  </style>
</head>
<body>
  <h1>🧠 ProjectPilotAI v3.5 (WebLLM IDE)</h1>

  <input type="file" id="fileInput" multiple />
  <div id="fileTree"></div>

  <input type="text" id="searchQuery" placeholder="🔍 Search your codebase..." />
  <button onclick="semanticSearch()">Search</button>
  <button onclick="startVoice()">🎙 Speak</button>
  <pre id="searchResults">⚡ Awaiting query...</pre>

  <div class="tabs">
    <div class="tab active" data-tab="code">📄 Code</div>
    <div class="tab" data-tab="summary">📝 Summary</div>
    <div class="tab" data-tab="refactor">♻️ Refactor</div>
    <div class="tab" data-tab="project">📊 Project</div>
    <div class="tab" data-tab="graph">🕸 Graph</div>
    <div class="tab" data-tab="tests">🧪 Tests</div>
    <div class="tab" data-tab="agent">🤖 Agent</div>
    <div class="tab" data-tab="chat">💬 Chat</div>
  </div>

  <div class="view active" id="code">
    <textarea id="codeInput" rows="15">// Select a file...</textarea>
  </div>

  <div class="view" id="summary">
    <button onclick="runLLM('Summarize the following code:')">🧠 Summarize</button>
    <pre id="summaryOutput">⚡ Summary pending...</pre>
  </div>

  <div class="view" id="refactor">
    <button onclick="runLLM('Refactor the following code for clarity:')">♻️ Refactor</button>
    <pre id="refactorOutput">⚡ Refactor pending...</pre>
  </div>

  <div class="view" id="project">
    <button onclick="generateGlobalSummary()">📊 Global Summary</button>
    <pre id="globalSummaryOutput">⚡ Not generated...</pre>
  </div>

  <div class="view" id="graph">
    <button onclick="renderDependencyGraph()">🕸 Render Graph</button>
    <div class="mermaid" id="graphContainer">graph TD</div>
  </div>

  <div class="view" id="tests">
    <button onclick="generateUnitTests()">🧪 Generate Unit Tests</button>
    <button onclick="exportToPDF()">📄 Export Report</button>
    <pre id="testOutput">⚡ Unit tests pending...</pre>
  </div>

  <div class="view" id="agent">
    <button onclick="runAgentMode()">🤖 Run Agent Mode</button>
    <pre id="agentOutput">⚡ Agent is idle...</pre>
  </div>

  <div class="view" id="chat">
    <h2>💬 Agent Chat</h2>
    <div id="chatLog" style="max-height: 300px; overflow-y: auto;"></div>
    <textarea id="chatInput" rows="3" placeholder="Ask your AI architect..."></textarea>
    <button onclick="sendChat()">Send</button>
  </div>

  <script type="module">
    import { ChatWorkerClient } from "https://mlc.ai/web-llm/dist/index.js";

    const tabs = document.querySelectorAll(".tab");
    const views = document.querySelectorAll(".view");
    const fileTree = document.getElementById("fileTree");
    const codeInput = document.getElementById("codeInput");

    let files = {};
    let model = null;
    let chatHistory = [];

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        views.forEach(v => v.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
      });
    });

    document.getElementById("fileInput").addEventListener("change", async (e) => {
      files = {};
      fileTree.innerHTML = "";

      for (const file of e.target.files) {
        files[file.webkitRelativePath || file.name] = await file.text();
      }

      renderTree(buildFileTree(files), fileTree);

      if (!model) {
        const client = new ChatWorkerClient();
        await client.reload("Llama-3-8B-Instruct-q4f32_1");
        model = client;
      }

      chatHistory = [
        {
          role: "system",
          content: `You're a senior AI architect. You know this codebase:\n\n` +
            Object.entries(files).map(([k, v]) => `File: ${k}\n${v}`).join("\n\n")
        }
      ];
    });

    function buildFileTree(fileMap) {
      const root = {};
      for (const path in fileMap) {
        const parts = path.split("/");
        let current = root;
        parts.forEach((part, idx) => {
          if (!current[part]) current[part] = (idx === parts.length - 1) ? path : {};
          current = current[part];
        });
      }
      return root;
    }

    function renderTree(node, container) {
      for (let key in node) {
        const div = document.createElement("div");
        if (typeof node[key] === "string") {
          div.textContent = `📄 ${key}`;
          div.onclick = () => loadFile(node[key]);
        } else {
          div.textContent = `📁 ${key}`;
          div.style.fontWeight = "bold";
          const child = document.createElement("div");
          child.style.marginLeft = "1rem";
          renderTree(node[key], child);
          div.appendChild(child);
        }
        container.appendChild(div);
      }
    }

    function loadFile(name) {
      codeInput.value = files[name];
      document.getElementById("summaryOutput").textContent = "⚡ Summary pending...";
      document.getElementById("refactorOutput").textContent = "⚡ Refactor pending...";
      document.getElementById("testOutput").textContent = "⚡ Unit tests pending...";
    }

    window.runLLM = async (prompt) => {
      const content = codeInput.value;
      const res = await model.chat.completions.create({
        messages: [
          { role: "system", content: "You're a senior software engineer." },
          { role: "user", content: `${prompt}\n\n${content}` }
        ],
        stream: false
      });
      const id = prompt.includes("Summarize") ? "summaryOutput" : "refactorOutput";
      document.getElementById(id).textContent = res.choices[0].message.content;
    };

    window.generateGlobalSummary = async () => {
      const all = Object.entries(files).map(([k, v]) => `File: ${k}\n${v}`).join("\n\n");
      const res = await model.chat.completions.create({
        messages: [
          { role: "system", content: "You're an architect." },
          { role: "user", content: `Summarize this project:\n\n${all}` }
        ],
        stream: false
      });
      document.getElementById("globalSummaryOutput").textContent = res.choices[0].message.content;
    };

    window.generateUnitTests = async () => {
      const content = codeInput.value;
      const res = await model.chat.completions.create({
        messages: [
          { role: "system", content: "You're a test engineer." },
          { role: "user", content: `Write unit tests for:\n\n${content}` }
        ],
        stream: false
      });
      document.getElementById("testOutput").textContent = res.choices[0].message.content;
    };

    window.semanticSearch = () => {
      const query = document.getElementById("searchQuery").value.toLowerCase();
      const results = Object.entries(files)
        .filter(([_, content]) => content.toLowerCase().includes(query))
        .map(([name]) => `✅ ${name}`)
        .join("\n");
      document.getElementById("searchResults").textContent = results || "❌ No matches.";
    };

    window.renderDependencyGraph = () => {
      let graph = "graph TD\n";
      for (const [name, content] of Object.entries(files)) {
        const matches = [...content.matchAll(/(import|require|from)\s+['"]([^'"]+)['"]/g)];
        matches.forEach(([, , dep]) => {
          graph += `"${name}" --> "${dep}"\n`;
        });
      }
      document.getElementById("graphContainer").textContent = graph;
      mermaid.init(undefined, "#graphContainer");
    };

    window.exportToPDF = () => {
      html2pdf().from(document.body).save("project_report.pdf");
    };

    window.startVoice = () => {
      const r = new webkitSpeechRecognition();
      r.lang = "en-US";
      r.onresult = e => {
        document.getElementById("searchQuery").value = e.results[0][0].transcript;
        semanticSearch();
      };
      r.start();
    };

    window.runAgentMode = async () => {
      let report = "🤖 Agent Mode Report:\n\n";
      for (const [filename, content] of Object.entries(files)) {
        const prompt = `Analyze the file "${filename}". Identify issues, improvements, and design flaws.\n\n${content}`;
        const res = await model.chat.completions.create({
          messages: [
            { role: "system", content: "You're a senior code reviewer." },
            { role: "user", content: prompt }
          ],
          stream: false
        });
        report += `📄 ${filename}\n${res.choices[0].message.content}\n\n---\n\n`;
        document.getElementById("agentOutput").textContent = report;
      }
    };

    window.sendChat = async () => {
      const input = document.getElementById("chatInput").value.trim();
      if (!input) return;
      chatHistory.push({ role: "user", content: input });
      document.getElementById("chatLog").innerHTML += `<div><b>You:</b> ${input}</div>`;
      document.getElementById("chatInput").value = "";

      const res = await model.chat.completions.create({
        messages: chatHistory,
        stream: false
      });
      const reply = res.choices[0].message.content;
      chatHistory.push({ role: "assistant", content: reply });
      document.getElementById("chatLog").innerHTML += `<div><b>Agent:</b> ${reply}</div>`;
    };
  </script>
</body>
</html>
