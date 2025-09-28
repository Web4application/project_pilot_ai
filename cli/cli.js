#!/usr/bin/env node

import readline from "readline";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import treeify from "treeify";
import fetch from "node-fetch";
import { askGPT } from "./gpt5mini.js";
import { execLine } from "./sandbox_runner/exec_line.js";
import { saveSession, loadSession } from "./sandbox_runner/session_manager.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log(chalk.green.bold("🚀 GPT-5 Maxi CLI IDE vFull Upgrade"));
console.log("Type :help for commands or normal text for GPT chat.\n");

// --- Globals ---
let currentProject = null;
let currentFile = null;
let debuggerActive = false;
let debugLines = [];
let currentLine = 0;
let debugLanguage = "";
let liveVariables = {};
let breakpoints = new Map(); // file -> Set(lines)
let watchExpressions = new Map(); // file -> Map(var, cond)
let sessionVariables = {}; // cross-file variables

// --- Helpers ---
const questionAsync = (promptText) => new Promise((res) => rl.question(promptText, res));

async function multiLineInput(promptText) {
  console.log(chalk.yellow(`${promptText} (end with empty line)`));
  const lines = [];
  for await (const line of rl) {
    if (line.trim() === "") break;
    lines.push(line);
  }
  return lines.join("\n");
}

// --- Project & File Management ---
async function handleCommand(input) {
  const parts = input.trim().split(" ");
  const cmd = parts[0].toLowerCase();

  switch (cmd) {
    case ":help":
      console.log(`
Commands:
:new <file>          - create new file in project
:open <file>         - open and display file
:list                - list files in project
:tree                - display project tree
:run <file>          - run full file
:debug <file>        - start live multi-file debugger
:watch <var> <cond>  - add watch expression
:clearwatch <var>    - remove watch
:break <line>        - add breakpoint
:clearbreak <line>   - remove breakpoint
:test <file>         - generate & run GPT unit tests
:exit                - exit IDE
      `);
      break;

    case ":new":
      if (!currentProject) {
        const projName = await questionAsync("Project name: ");
        currentProject = path.resolve(`sessions/${projName}`);
        fs.mkdirSync(currentProject, { recursive: true });
        console.log(chalk.green(`Project created: ${currentProject}`));
      }
      const newFile = parts[1] || await questionAsync("File name: ");
      currentFile = path.resolve(currentProject, newFile);
      const code = await multiLineInput(`Write code for ${newFile}`);
      fs.writeFileSync(currentFile, code, "utf8");
      console.log(chalk.green(`File created: ${currentFile}`));
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
      if (!currentProject) { console.log(chalk.yellow("No project opened.")); break; }
      const files = fs.readdirSync(currentProject);
      files.forEach(f => console.log(f));
      break;

    case ":tree":
      displayProjectTree(currentProject);
      break;

    case ":run":
      await runFile(parts[1] || currentFile);
      break;

    case ":debug":
      await startLiveDebugger(parts[1] || currentFile);
      break;

    case ":watch":
      if (!watchExpressions.has(currentFile)) watchExpressions.set(currentFile, new Map());
      watchExpressions.get(currentFile).set(parts[1], parts.slice(2).join(" "));
      console.log(chalk.green(`Watch set: ${parts[1]} ${parts.slice(2).join(" ")}`));
      break;

    case ":clearwatch":
      if (watchExpressions.has(currentFile)) watchExpressions.get(currentFile).delete(parts[1]);
      console.log(chalk.yellow(`Watch cleared: ${parts[1]}`));
      break;

    case ":break":
      if (!breakpoints.has(currentFile)) breakpoints.set(currentFile, new Set());
      breakpoints.get(currentFile).add(parseInt(parts[1]));
      console.log(chalk.green(`Breakpoint set at line ${parts[1]}`));
      break;

    case ":clearbreak":
      if (breakpoints.has(currentFile)) breakpoints.get(currentFile).delete(parseInt(parts[1]));
      console.log(chalk.yellow(`Breakpoint cleared at line ${parts[1]}`));
      break;

    case ":test":
      await generateAndRunTests(parts[1] || currentFile);
      break;

    case ":exit":
      saveCurrentSession(currentProject);
      console.log(chalk.yellow("Exiting IDE. Goodbye!"));
      rl.close();
      break;

    default:
      console.log(chalk.red("Unknown command."));
  }
}

// --- Project Tree ---
function displayProjectTree(projectPath) {
  if (!projectPath || !fs.existsSync(projectPath)) return;
  function readDirRecursive(dir) {
    const result = {};
    fs.readdirSync(dir).forEach(f => {
      const fullPath = path.join(dir, f);
      if (fs.statSync(fullPath).isDirectory()) result[f] = readDirRecursive(fullPath);
      else result[f] = null;
    });
    return result;
  }
  const tree = readDirRecursive(projectPath);
  console.log(treeify.asTree(tree, true));
}

// --- Run Full File ---
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
  } catch (err) { console.log(chalk.red(err.message)); }
}

// --- Start Live Debugger ---
async function startLiveDebugger(filePath) {
  if (!fs.existsSync(filePath)) return console.log(chalk.red("File not found."));
  currentFile = filePath;
  debugLanguage = path.extname(filePath).slice(1);
  debugLines = fs.readFileSync(filePath, "utf8").split("\n");
  currentLine = 0;
  liveVariables = sessionVariables[currentFile] || {};
  debuggerActive = true;

  console.log(chalk.yellow.bold(`🚦 Live Debugging ${filePath}`));
  console.log("Commands inside debugger: :step | :next | :vars | :exitdebug\n");
  await executeCurrentLine();
}

// --- Execute Line ---
async function executeCurrentLine() {
  if (!debuggerActive || currentLine >= debugLines.length) return console.log(chalk.green.bold("✅ End of file reached."));

  const lineContent = debugLines[currentLine];
  try {
    const data = await execLine(debugLanguage, lineContent, liveVariables);
    liveVariables = data.variables || liveVariables;
    sessionVariables[currentFile] = liveVariables;
    if (data.output) console.log(chalk.green(`[${currentFile}] ${data.output}`));

    // Breakpoints
    if (breakpoints.has(currentFile) && breakpoints.get(currentFile).has(currentLine + 1))
      console.log(chalk.yellow.bold(`🛑 Breakpoint hit at ${currentFile}:${currentLine + 1}`));

    // Watches
    if (watchExpressions.has(currentFile)) {
      for (const [varName, cond] of watchExpressions.get(currentFile)) {
        if (liveVariables[varName] !== undefined && eval(`${JSON.stringify(liveVariables[varName])} ${cond}`)) {
          console.log(chalk.red.bold(`⚠ Watch triggered: ${varName} = ${liveVariables[varName]}`));
        }
      }
    }

    // GPT Explanation
    const explanation = await askGPT(
      `Explain this ${debugLanguage} line and variable states:\n${lineContent}\nVariables: ${JSON.stringify(liveVariables)}`,
      "coderunner"
    );
    console.log(chalk.magenta(explanation));

    // Auto-fix
    const suggestion = await askGPT(`Suggest a corrected/improved version of this line if needed:\n${lineContent}`, "coderunner");
    if (suggestion && suggestion !== lineContent) {
      console.log(chalk.green.bold("💡 Suggested fix:"));
      console.log(chalk.green(suggestion));
      const apply = await questionAsync("Apply fix? (y/n): ");
      if (apply.toLowerCase() === "y") debugLines[currentLine] = suggestion;
    }

  } catch (err) { console.log(chalk.red(`Sandbox error: ${err.message}`)); }
}

// --- Step ---
async function stepLine() {
  currentLine++;
  await executeCurrentLine();
}

// --- GPT Unit Tests ---
async function generateAndRunTests(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const prompt = `Generate unit tests for this ${path.extname(filePath).slice(1)} file. Return full test code ready to save and run:\n${code}`;
  const testCode = await askGPT(prompt, "coderunner");

  const testFilePath = path.join(path.dirname(filePath), "tests", path.basename(filePath, path.extname(filePath)) + ".test." + path.extname(filePath).slice(1));
  fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
  fs.writeFileSync(testFilePath, testCode, "utf8");
  console.log(chalk.green(`Tests saved: ${testFilePath}`));
  await runFile(testFilePath);
}

// --- Save Session ---
function saveCurrentSession(projectName) {
  saveSession(projectName, {
    liveVariables: sessionVariables,
    breakpoints: Array.from(breakpoints),
    watchExpressions: Array.from(watchExpressions),
    currentLine,
  });
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
