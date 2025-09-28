#!/usr/bin/env node

import readline from "readline";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { askGPT } from "./gpt5mini.js";
import fetch from "node-fetch";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log(chalk.green.bold("🚀 GPT-5 Maxi CLI IDE vFull"));
console.log("Use :commands for project operations or normal text for GPT chat.\n");

// --- Globals ---
let currentProject = null;
let currentFile = null;
let debuggerActive = false;
let debugLines = [];
let currentLine = 0;
let debugLanguage = "";
let liveVariables = {};
let breakpoints = new Set();
let watchExpressions = new Map();

// --- Helper functions ---
function questionAsync(promptText) {
  return new Promise((resolve) => rl.question(promptText, resolve));
}

// --- CLI Commands ---
async function handleCommand(input) {
  const parts = input.split(" ");
  const cmd = parts[0].toLowerCase();

  switch(cmd) {
    case ":new":
      if (!currentProject) {
        const projName = await questionAsync("Project name: ");
        currentProject = path.resolve(`sessions/${projName}`);
        fs.mkdirSync(currentProject, { recursive: true });
      }
      const newFile = parts[1] || await questionAsync("File name: ");
      currentFile = path.resolve(currentProject, newFile);
      const code = await multiLineInput(`Write code for ${newFile}`);
      fs.writeFileSync(currentFile, code, "utf8");
      console.log(chalk.green(`Created: ${currentFile}`));
      break;

    case ":open":
      const openFile = parts[1] || currentFile;
      if (!openFile || !fs.existsSync(openFile)) {
        console.log(chalk.red("File not found."));
        break;
      }
      currentFile = openFile;
      const content = fs.readFileSync(currentFile, "utf8");
      console.log(chalk.blue(content));
      break;

    case ":list":
      if (!currentProject) {
        console.log(chalk.yellow("No project opened."));
        break;
      }
      const files = fs.readdirSync(currentProject);
      files.forEach(f => console.log(f));
      break;

    case ":run":
      await runFile(parts[1] || currentFile);
      break;

    case ":debug":
      await startLiveDebugger(parts[1] || currentFile);
      break;

    case ":watch":
      watchExpressions.set(parts[1], parts.slice(2).join(" "));
      console.log(chalk.green(`Watch set: ${parts[1]} ${parts.slice(2).join(" ")}`));
      break;

    case ":clearwatch":
      watchExpressions.delete(parts[1]);
      console.log(chalk.yellow(`Watch cleared: ${parts[1]}`));
      break;

    case ":break":
      breakpoints.add(parseInt(parts[1]));
      console.log(chalk.green(`Breakpoint set at line ${parts[1]}`));
      break;

    case ":clearbreak":
      breakpoints.delete(parseInt(parts[1]));
      console.log(chalk.yellow(`Breakpoint cleared at line ${parts[1]}`));
      break;

    case ":test":
      await generateAndRunTests(parts[1] || currentFile);
      break;

    case ":exit":
      console.log(chalk.yellow("Exiting IDE. Goodbye!"));
      rl.close();
      break;

    default:
      console.log(chalk.red("Unknown command."));
  }
}

// --- Multi-line input ---
async function multiLineInput(promptText) {
  console.log(chalk.yellow(`${promptText} (end with empty line)`));
  const lines = [];
  for await (const line of rl) {
    if (line.trim() === "") break;
    lines.push(line);
  }
  return lines.join("\n");
}

// --- Run File ---
async function runFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return console.log(chalk.red("File not found."));
  const ext = path.extname(filePath).slice(1);
  const code = fs.readFileSync(filePath, "utf8");

  try {
    const response = await fetch("http://localhost:5000/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: ext, code }),
    });
    const data = await response.json();
    console.log(chalk.green.bold("=== Output ==="));
    console.log(data.output || data.error);
  } catch (err) {
    console.log(chalk.red(err.message));
  }
}

// --- Start Live Debugger ---
async function startLiveDebugger(filePath) {
  if (!fs.existsSync(filePath)) return console.log(chalk.red("File not found."));
  debugFile = filePath;
  debugLanguage = path.extname(filePath).slice(1);
  debugLines = fs.readFileSync(filePath, "utf8").split("\n");
  currentLine = 0;
  liveVariables = {};
  debuggerActive = true;

  console.log(chalk.yellow.bold(`🚦 Live Debugging ${filePath}`));
  console.log("Commands: :step | :next | :vars | :break <line> | :watch <var> <cond> | :exitdebug\n");
  await executeCurrentLine();
}

// --- Execute Line with Live Variables + GPT ---
async function executeCurrentLine() {
  if (!debuggerActive || currentLine >= debugLines.length) {
    console.log(chalk.green.bold("✅ End of file reached."));
    debuggerActive = false;
    return;
  }

  const lineContent = debugLines[currentLine];

  try {
    const response = await fetch("http://localhost:5000/exec_line", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: debugLanguage, line: lineContent, variables: liveVariables }),
    });
    const data = await response.json();
    liveVariables = data.variables || liveVariables;
    if (data.output) console.log(chalk.green(data.output));

    // Breakpoints
    if (breakpoints.has(currentLine + 1)) console.log(chalk.yellow.bold(`🛑 Breakpoint at line ${currentLine + 1}`));

    // Watch expressions
    for (const [varName, condition] of watchExpressions) {
      if (liveVariables[varName] !== undefined && eval(`${JSON.stringify(liveVariables[varName])} ${condition}`)) {
        console.log(chalk.red.bold(`⚠ Watch triggered: ${varName} = ${liveVariables[varName]}`));
      }
    }

    // GPT-5 Explanation + Auto-Fix
    const prompt = `
You are an expert ${debugLanguage} programmer.
Explain this line and its effect on current variables:
${lineContent}

Variables: ${JSON.stringify(liveVariables)}
`;
    const explanation = await askGPT(prompt, "coderunner");
    console.log(chalk.magenta(explanation));

    // Auto-Fix Suggestion
    const fixPrompt = `
Suggest a corrected/improved version of this line if needed:
${lineContent}
`;
    const suggestion = await askGPT(fixPrompt, "coderunner");
    if (suggestion && suggestion !== lineContent) {
      console.log(chalk.green.bold("💡 Suggested fix:"));
      console.log(chalk.green(suggestion));
      const apply = await questionAsync("Apply fix? (y/n): ");
      if (apply.toLowerCase() === "y") debugLines[currentLine] = suggestion;
    }

  } catch (err) {
    console.log(chalk.red(`Error executing line: ${err.message}`));
  }
}

// --- Step / Next Line ---
async function stepLine() {
  currentLine++;
  await executeCurrentLine();
}

// --- Generate & Run projectpilot Unit Tests ---
async function generateAndRunTests(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const prompt = `
Generate unit tests for this ${path.extname(filePath).slice(1)} file:
${code}
Return full test code ready to save and run.
`;
  const testCode = await askGPT(prompt, "coderunner");

  const testFilePath = path.join(path.dirname(filePath), "tests", path.basename(filePath, path.extname(filePath)) + ".test." + path.extname(filePath).slice(1));
  fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
  fs.writeFileSync(testFilePath, testCode, "utf8");
  console.log(chalk.green(`Tests saved: ${testFilePath}`));

  // Run tests
  await runFile(testFilePath);
}

// --- Main Loop ---
async function main() {
  rl.setPrompt("> ");
  rl.prompt();
  for await (const input of rl) {
    try {
      if (debuggerActive) {
        if (input.trim() === ":step" || input.trim() === ":next") await stepLine();
        else if (input.trim() === ":vars") console.log(chalk.yellow(JSON.stringify(liveVariables, null, 2)));
        else if (input.trim() === ":exitdebug") debuggerActive = false;
        else await handleCommand(input);
      } else {
        if (input.startsWith(":")) await handleCommand(input);
        else {
          const response = await askGPT(input, "friendly");
          console.log(chalk.cyan.bold(response || "[No output]"));
        }
      }
    } catch (err) { console.log(chalk.red("Error:"), err.message); }
    rl.prompt();
  }
}

main();
