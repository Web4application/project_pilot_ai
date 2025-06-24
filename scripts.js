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
      content: `You are an AI software architect with access to this project:\n\n` +
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
  ["summaryOutput", "refactorOutput", "testOutput"].forEach(id => {
    document.getElementById(id).textContent = "⚡ Processing...";
  });
}

window.runLLM = async (prompt) => {
  const content = codeInput.value;
  const res = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You're a senior developer." },
      { role: "user", content: `${prompt}\n\n${content}` }
    ],
    stream: false
  });
  const target = prompt.includes("Summarize") ? "summaryOutput" : "refactorOutput";
  document.getElementById(target).textContent = res.choices[0].message.content;
};

window.generateUnitTests = async () => {
  const content = codeInput.value;
  const res = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You're a test engineer." },
      { role: "user", content: `Write unit tests for this code:\n\n${content}` }
    ],
    stream: false
  });
  document.getElementById("testOutput").textContent = res.choices[0].message.content;
};

window.generateGlobalSummary = async () => {
  const all = Object.entries(files).map(([k, v]) => `File: ${k}\n${v}`).join("\n\n");
  const res = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You're a technical analyst." },
      { role: "user", content: `Summarize the project:\n\n${all}` }
    ],
    stream: false
  });
  document.getElementById("globalSummaryOutput").textContent = res.choices[0].message.content;
};

window.semanticSearch = () => {
  const query = document.getElementById("searchQuery").value.toLowerCase();
  const results = Object.entries(files)
    .filter(([_, content]) => content.toLowerCase().includes(query))
    .map(([name]) => `✅ ${name}`)
    .join("\n");
  document.getElementById("searchResults").textContent = results || "❌ No matches.";
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

window.runAgentMode = async () => {
  let report = "🧠 Agent Mode Report:\n\n";
  document.getElementById("agentOutput").textContent = "🤖 Running analysis...";

  for (const [filename, content] of Object.entries(files)) {
    const prompt = `Analyze the file "${filename}" for bugs, design issues, and improvements.\n\n${content}`;
    const result = await model.chat.completions.create({
      messages: [
        { role: "system", content: "You're a senior architect." },
        { role: "user", content: prompt }
      ],
      stream: false
    });
    report += `📄 ${filename}\n${result.choices[0].message.content}\n\n---\n\n`;
    document.getElementById("agentOutput").textContent = report;
  }

  const fullCode = Object.entries(files).map(([k, v]) => `File: ${k}\n${v}`).join("\n\n");
  const global = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You're an AI architect." },
      { role: "user", content: `Based on this project, suggest large-scale refactors:\n\n${fullCode}` }
    ],
    stream: false
  });

  report += `🏗️ Global Refactor:\n${global.choices[0].message.content}`;
  document.getElementById("agentOutput").textContent = report;
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
