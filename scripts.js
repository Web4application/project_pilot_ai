import { ChatWorkerClient } from "https://mlc.ai/web-llm/dist/index.js";
import { ChatWorkerClient } from "https://mlc.ai/web-llm/dist/index.js";

const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const fileTree = document.getElementById("fileTree");
const codeInput = document.getElementById("codeInput");

let files = {};
let model = null;

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

  const tree = buildFileTree(files);
  renderTree(tree, fileTree);

  if (!model) {
    const client = new ChatWorkerClient();
    await client.reload("Llama-3-8B-Instruct-q4f32_1");
    model = client;
  }
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
      { role: "system", content: "You are a senior developer." },
      { role: "user", content: `${prompt}\n\n${content}` }
    ],
    stream: false
  });
  const target = prompt.includes("Summarize") ? "summaryOutput" : "refactorOutput";
  document.getElementById(target).textContent = res.choices[0].message.content;
};

window.generateGlobalSummary = async () => {
  const all = Object.entries(files).map(([k, v]) => `File: ${k}\n${v}`).join("\n\n");
  const res = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You're a project analyst." },
      { role: "user", content: `Provide an overview of the project:\n\n${all}` }
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
      { role: "user", content: `Generate unit tests for this code:\n\n${content}` }
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
  const content = document.body;
  html2pdf().from(content).save("project_report.pdf");
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

const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const fileTree = document.getElementById("fileTree");
const codeInput = document.getElementById("codeInput");

let files = {};
let model = null;

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

  const tree = buildFileTree(files);
  renderTree(tree, fileTree);

  if (!model) {
    const client = new ChatWorkerClient();
    await client.reload("Llama-3-8B-Instruct-q4f32_1");
    model = client;
  }
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
      { role: "system", content: "You are a senior developer." },
      { role: "user", content: `${prompt}\n\n${content}` }
    ],
    stream: false
  });
  const target = prompt.includes("Summarize") ? "summaryOutput" : "refactorOutput";
  document.getElementById(target).textContent = res.choices[0].message.content;
};

window.generateGlobalSummary = async () => {
  const all = Object.entries(files).map(([k, v]) => `File: ${k}\n${v}`).join("\n\n");
  const res = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You're a project analyst." },
      { role: "user", content: `Provide an overview of the project:\n\n${all}` }
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
      { role: "user", content: `Generate unit tests for this code:\n\n${content}` }
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
  const content = document.body;
  html2pdf().from(content).save("project_report.pdf");
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
let chatHistory = [
  {
    role: "system",
    content: `You are an advanced AI software architect. You have access to a virtual codebase. 
You will assist the user by answering questions, analyzing code, suggesting improvements, 
refactors, test strategies, and architectural redesigns.

Below is the full codebase:\n\n${Object.entries(files)
  .map(([k, v]) => `File: ${k}\n${v}`)
  .join("\n\n")}`
  }
];

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

window.runAgentMode = async () => {
  document.getElementById("agentOutput").textContent = "🤖 Running analysis...";
  let report = "🧠 Agent Mode Report:\n\n";

  for (const [filename, content] of Object.entries(files)) {
    const prompt = `You are a senior software architect. Analyze the file "${filename}" in detail. 
Identify any problems, bad practices, or potential improvements. Suggest concise refactor strategies. 
Explain how this file fits in a larger system. Here's the code:\n\n${content}`;

    const result = await model.chat.completions.create({
      messages: [
        { role: "system", content: "You're an elite AI engineer conducting a project audit." },
        { role: "user", content: prompt }
      ],
      stream: false
    });

    report += `📄 ${filename}\n${result.choices[0].message.content}\n\n---\n\n`;
    document.getElementById("agentOutput").textContent = report;
  }

  // Global-level insights
  const all = Object.entries(files).map(([k, v]) => `File: ${k}\n${v}`).join("\n\n");

  const global = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You're an AI software architect." },
      { role: "user", content: `Given this entire codebase, propose large-scale refactoring ideas, 
architecture improvements, and warnings about structure or performance:\n\n${all}` }
    ],
    stream: false
  });

  report += `🏗️ Global Architecture Suggestions:\n${global.choices[0].message.content}`;
  document.getElementById("agentOutput").textContent = report;
};

let chatHistory = [
  {
    role: "system",
    content: `You are an advanced AI software architect. You have access to a virtual codebase. 
You will assist the user by answering questions, analyzing code, suggesting improvements, 
refactors, test strategies, and architectural redesigns.

Below is the full codebase:\n\n${Object.entries(files)
  .map(([k, v]) => `File: ${k}\n${v}`)
  .join("\n\n")}`
  }
];

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
