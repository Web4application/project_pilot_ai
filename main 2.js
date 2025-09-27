const { ActivityHandler } = require('botbuilder');
const fs = require('fs');
const path = require('path');
const { MemoryStorage, UserState } = require('botbuilder');
const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const regex = /require\(['"](.+?)['"]\)|import .+ from ['"](.+?)['"]/g;

class ScriptAnalyzerBot extends ActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {
    const userName = context.activity.from.name || 'there';
    await context.sendActivity(`Hey ${userName}! 👋 You said: "${context.activity.text}"`);
    await next();
});

        this.onMessage(async (context, next) => {
  const text = context.activity.text.toLowerCase();

  if (text.startsWith('explain')) {
    const fileName = text.replace('explain', '').trim();
    const filePath = path.join('./scripts', fileName);
    
    if (!fs.existsSync(filePath)) {
      await context.sendActivity(`❌ File not found: ${fileName}`);
    } else {
      const code = fs.readFileSync(filePath, 'utf8');
      const explanation = await explainCode(code);
      await context.sendActivity(`📘 GPT says:\n${explanation}`);
    }
  } else if (text.startsWith('refactor')) {
    const fileName = text.replace('refactor', '').trim();
    const filePath = path.join('./scripts', fileName);
    
    if (!fs.existsSync(filePath)) {
      await context.sendActivity(`❌ File not found: ${fileName}`);
    } else {
      const code = fs.readFileSync(filePath, 'utf8');
      const refactoredCode = await refactorCode(code);
      await context.sendActivity(`🔄 Refactored Code:\n${refactoredCode}`);
    }
  } else if (text.startsWith('check errors')) {
    const fileName = text.replace('check errors', '').trim();
    const filePath = path.join('./scripts', fileName);
    
    if (!fs.existsSync(filePath)) {
      await context.sendActivity(`❌ File not found: ${fileName}`);
    } else {
      const code = fs.readFileSync(filePath, 'utf8');
      const errors = await checkForErrors(code);
      await context.sendActivity(`⚠️ Code Issues Detected:\n${errors}`);
    }
  }

  await next();
});

            if (text.includes('analyze my scripts')) {
                const directoryPath = './scripts';
                const result = this.analyzeDirectory(directoryPath);
                await context.sendActivity(result);
            } else {
                await context.sendActivity("🧠 Say 'analyze my scripts' and make sure your JS files are in the `/scripts` folder.");
            }

            await next();
        });
    }

    analyzeDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) return "⚠️ scripts/ folder not found.";

        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
        const graph = {};
        const fileContents = {};

        for (let file of files) {
            const fullPath = path.join(dirPath, file);
            const content = fs.readFileSync(fullPath, 'utf8');
            fileContents[file] = content;

            const deps = [];
            const regex = /require\(['"](.+?)['"]\)|import .* from ['"](.+?)['"]/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const depPath = match[1] || match[2];
                let dep = depPath;
                if (!dep.endsWith('.js')) dep += '.js';
                if (dep.startsWith('./')) dep = dep.replace('./', '');
                deps.push(dep);
            }

            graph[file] = deps.filter(d => files.includes(d));
        }

        const loadOrder = this.topoSort(graph);
        const explanation = loadOrder.map((f, i) => `${i + 1}. ${f}`).join('\n');
        return `📊 Suggested Load Order:\n${explanation}`;
    }

    topoSort(graph) {
        const visited = new Set();
        const stack = [];

        const visit = (node) => {
            if (!visited.has(node)) {
                visited.add(node);
                (graph[node] || []).forEach(dep => visit(dep));
                stack.push(node);
            }
        };

        Object.keys(graph).forEach(visit);
        return stack.reverse();
    }
}

module.exports.ScriptAnalyzerBot = ScriptAnalyzerBot;
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function refactorCode(code) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: `Please refactor this JavaScript code for better readability and performance:\n\n${code}` }
      ]
    });
    return res.choices[0].message.content;
  } catch (error) {
    console.error("Error with Code Refactoring:", error);
    return "Sorry, I couldn't refactor the code.";
  }
}

async function checkForErrors(code) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: `Please check this JavaScript code for potential errors or issues:\n\n${code}` }
      ]
    });
    return res.choices[0].message.content;
  } catch (error) {
    console.error("Error with Error Checking:", error);
    return "Sorry, I couldn't check for errors in the code.";
  }
}
const { ActivityHandler } = require('botbuilder');

class SoftwareFlowBot extends ActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {
            const text = context.activity.text.toLowerCase();

            if (text.includes('analyze scripts')) {
                await context.sendActivity("📦 Please list the scripts and their dependencies like this:\n\n" +
                    "`main.js requires db.js and utils.js`");
            } else if (text.includes('.js')) {
                const order = this.analyzeScriptFlow(text);
                await context.sendActivity(`🧠 Suggested Load Order:\n${order.map((f, i) => `${i + 1}. ${f}`).join('\n')}`);
            } else {
                await context.sendActivity("Say 'analyze scripts' to begin.");
            }

            await next();
        });
    }

    analyzeScriptFlow(text) {
        const lines = text.split('\n');
        const graph = {};
        const allFiles = new Set();

        lines.forEach(line => {
            const parts = line.match(/(\w+\.js) requires (.+)/);
            if (parts) {
                const file = parts[1];
                const deps = parts[2].split(/and|,/).map(s => s.trim());
                graph[file] = deps;
                deps.forEach(dep => allFiles.add(dep));
                allFiles.add(file);
            }
        });

        // Topological sort
        const visited = new Set();
        const stack = [];

        const visit = (file) => {
            if (!visited.has(file)) {
                visited.add(file);
                (graph[file] || []).forEach(visit);
                stack.push(file);
            }
        };

        allFiles.forEach(visit);
        return stack.reverse();
    }
}

module.exports.SoftwareFlowBot = SoftwareFlowBot;

const { ActivityHandler, MemoryStorage, UserState } = require('botbuilder');

const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);

// State property names
const MOOD = 'mood';
const STUDY = 'study';
const WORKOUT = 'workout';
const NOTES = 'notes';

class PersonalBot extends ActivityHandler {
    constructor() {
        super();

        this.moodAccessor = userState.createProperty(MOOD);
        this.studyAccessor = userState.createProperty(STUDY);
        this.workoutAccessor = userState.createProperty(WORKOUT);
        this.notesAccessor = userState.createProperty(NOTES);

        this.onMessage(async (context, next) => {
            const text = context.activity.text.toLowerCase();

            // Mood Tracking
            if (text.startsWith('mood')) {
                const mood = text.replace('mood', '').trim();
                await this.moodAccessor.set(context, mood);
                await context.sendActivity(`🧠 Noted! You're feeling "${mood}".`);
            }

            // Study Tracker
            else if (text.startsWith('study')) {
                const match = text.match(/study (.+) at (.+)/);
                if (match) {
                    const subject = match[1];
                    const time = match[2];
                    await this.studyAccessor.set(context, { subject, time });
                    await context.sendActivity(`📚 Study plan saved: ${subject} at ${time}.`);
                } else {
                    await context.sendActivity("Format it like: study [subject] at [time].");
                }
            }

            // Workout Tracker
            else if (text.startsWith('workout')) {
                const workout = text.replace('workout', '').trim();
                await this.workoutAccessor.set(context, workout);
                await context.sendActivity(`💪 Workout saved: "${workout}". Beast mode!`);
            }

            // Daily Motivation
            else if (text.includes('motivate') || text.includes('motivation')) {
                const quote = this.getRandomQuote();
                await context.sendActivity(`🌟 Here's your motivation: "${quote}"`);
            }

            // Notes or Reminders
            else if (text.startsWith('note')) {
                const note = text.replace('note', '').trim();
                const currentNotes = await this.notesAccessor.get(context, []);
                currentNotes.push(note);
                await this.notesAccessor.set(context, currentNotes);
                await context.sendActivity(`📝 Note added: "${note}"`);
            }

            // Recall info
            else if (text.includes('what') || text.includes('show')) {
                const mood = await this.moodAccessor.get(context);
                const study = await this.studyAccessor.get(context);
                const workout = await this.workoutAccessor.get(context);
                const notes = await this.notesAccessor.get(context, []);

                let message = "📋 Here's what I know:\n";
                if (mood) message += `- Mood: ${mood}\n`;
                if (study) message += `- Study: ${study.subject} at ${study.time}\n`;
                if (workout) message += `- Last Workout: ${workout}\n`;
                if (notes.length > 0) message += `- Notes:\n  - ${notes.join('\n  - ')}\n`;

                if (message === "📋 Here's what I know:\n") {
                    message += "Nothing yet! Start telling me things like 'mood happy' or 'workout leg day'.";
                }

                await context.sendActivity(message);
            }

            // Help or unknown input
            else {
                await context.sendActivity("🤖 I can help you with:\n" +
                    "- `mood [how you feel]`\n" +
                    "- `study [subject] at [time]`\n" +
                    "- `workout [what you did]`\n" +
                    "- `note [something to remember]`\n" +
                    "- `motivate me`\n" +
                    "- Ask me 'what do you know' to recall your info.");
            }

            await userState.saveChanges(context);
            await next();
        });
    }

    getRandomQuote() {
        const quotes = [
            "Keep pushing forward. 🚀",
            "You’ve got this! 💪",
            "Progress, not perfection. 💡",
            "Do something today your future self will thank you for. 📈",
            "Small steps lead to big changes. 👣"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
}

module.exports.PersonalBot = PersonalBot;

const { ActivityHandler, MemoryStorage, UserState } = require('botbuilder');

const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const WORKOUT_PROPERTY = 'workoutInfo';

class WorkoutBot extends ActivityHandler {
    constructor() {
        super();
        this.workoutAccessor = userState.createProperty(WORKOUT_PROPERTY);

        this.onMessage(async (context, next) => {
            const text = context.activity.text.toLowerCase();
            const workout = await this.workoutAccessor.get(context, { lastWorkout: null });

            if (text.includes('workout')) {
                workout.lastWorkout = text.replace('workout', '').trim();
                await context.sendActivity(`💥 Nice! I saved your workout: "${workout.lastWorkout}". Keep it up!`);
            } else if (text.includes('what did i do')) {
                if (workout.lastWorkout) {
                    await context.sendActivity(`🏋️ You last did: "${workout.lastWorkout}". Ready for more?`);
                } else {
                    await context.sendActivity("You haven't told me about any workouts yet. Say something like 'workout chest day'.");
                }
            } else {
                await context.sendActivity("Tell me about your workout or ask me what you did last time.");
            }

            await this.workoutAccessor.set(context, workout);
            await userState.saveChanges(context);
            await next();
        });
    }
}

module.exports.WorkoutBot = WorkoutBot;

const { ActivityHandler, MemoryStorage, UserState } = require('botbuilder');

const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const STUDY_PROPERTY = 'studyInfo';

class StudyBot extends ActivityHandler {
    constructor() {
        super();
        this.studyAccessor = userState.createProperty(STUDY_PROPERTY);

        this.onMessage(async (context, next) => {
            const text = context.activity.text.toLowerCase();
            const studyInfo = await this.studyAccessor.get(context, { subject: null, time: null });

            if (text.includes('study')) {
                const match = text.match(/study (.+) at (.+)/);
                if (match) {
                    studyInfo.subject = match[1];
                    studyInfo.time = match[2];
                    await context.sendActivity(`✅ Got it! I’ll remind you to study ${studyInfo.subject} at ${studyInfo.time}.`);
                } else {
                    await context.sendActivity("Tell me what to study and when, like 'study math at 6pm'.");
                }
            } else {
                if (studyInfo.subject && studyInfo.time) {
                    await context.sendActivity(`⏰ Remember to study ${studyInfo.subject} at ${studyInfo.time}!`);
                } else {
                    await context.sendActivity("I don't have a study schedule for you. Tell me like 'study science at 5pm'.");
                }
            }

            await this.studyAccessor.set(context, studyInfo);
            await userState.saveChanges(context);
            await next();
        });
    }
}

module.exports.StudyBot = StudyBot;

const { ActivityHandler, MemoryStorage, UserState } = require('botbuilder');

const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const MOOD_PROPERTY = 'userMood';

class MoodBot extends ActivityHandler {
    constructor() {
        super();
        this.userMoodAccessor = userState.createProperty(MOOD_PROPERTY);

        this.onMessage(async (context, next) => {
            const text = context.activity.text.toLowerCase();
            let mood = await this.userMoodAccessor.get(context, null);

            if (text.includes('reset')) {
                await this.userMoodAccessor.set(context, null);
                await context.sendActivity("Alright, your mood history is reset. How are you feeling now?");
            } else if (!mood) {
                await this.userMoodAccessor.set(context, text);
                await context.sendActivity(`Got it. You're feeling "${text}". I'll remember that! 😊`);
            } else {
                await context.sendActivity(`You told me you're feeling "${mood}". Want to update it? Just say how you feel.`);
            }

            await userState.saveChanges(context);
            await next();
        });
    }
}

module.exports.MoodBot = MoodBot;

const { ActivityHandler, MemoryStorage, UserState } = require('botbuilder');

const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const MOOD_PROPERTY = 'userMood';

class MoodBot extends ActivityHandler {
    constructor() {
        super();
        this.userMoodAccessor = userState.createProperty(MOOD_PROPERTY);

        this.onMessage(async (context, next) => {
            const text = context.activity.text.toLowerCase();
            let mood = await this.userMoodAccessor.get(context, null);

            if (text.includes('reset')) {
                await this.userMoodAccessor.set(context, null);
                await context.sendActivity("Alright, your mood history is reset. How are you feeling now?");
            } else if (!mood) {
                await this.userMoodAccessor.set(context, text);
                await context.sendActivity(`Got it. You're feeling "${text}". I'll remember that! 😊`);
            } else {
                await context.sendActivity(`You told me you're feeling "${mood}". Want to update it? Just say how you feel.`);
            }

            await userState.saveChanges(context);
            await next();
        });
    }
}

module.exports.MoodBot = MoodBot;

const { ActivityHandler, MemoryStorage, UserState } = require('botbuilder');

const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const STUDY_PROPERTY = 'studyInfo';

class StudyBot extends ActivityHandler {
    constructor() {
        super();
        this.studyAccessor = userState.createProperty(STUDY_PROPERTY);

        this.onMessage(async (context, next) => {
            const text = context.activity.text.toLowerCase();
            const studyInfo = await this.studyAccessor.get(context, { subject: null, time: null });

            if (text.includes('study')) {
                const match = text.match(/study (.+) at (.+)/);
                if (match) {
                    studyInfo.subject = match[1];
                    studyInfo.time = match[2];
                    await context.sendActivity(`✅ Got it! I’ll remind you to study ${studyInfo.subject} at ${studyInfo.time}.`);
                } else {
                    await context.sendActivity("Tell me what to study and when, like 'study math at 6pm'.");
                }
            } else {
                if (studyInfo.subject && studyInfo.time) {
                    await context.sendActivity(`⏰ Remember to study ${studyInfo.subject} at ${studyInfo.time}!`);
                } else {
                    await context.sendActivity("I don't have a study schedule for you. Tell me like 'study science at 5pm'.");
                }
            }

            await this.studyAccessor.set(context, studyInfo);
            await userState.saveChanges(context);
            await next();
        });
    }
}

module.exports.StudyBot = StudyBot;

const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function explainCode(code) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: `Explain what this JavaScript code does:\n\n${code}` }
      ]
    });
    return res.choices[0].message.content;
  } catch (error) {
    console.error("Error with GPT Explanation:", error);
    return "Sorry, I couldn't explain that code.";
  }
}

async function refactorCode(code) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: `Please refactor this JavaScript code for better readability and performance:\n\n${code}` }
      ]
    });
    return res.choices[0].message.content;
  } catch (error) {
    console.error("Error with Code Refactoring:", error);
    return "Sorry, I couldn't refactor the code.";
  }
}

async function checkForErrors(code) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: `Please check this JavaScript code for potential errors or issues:\n\n${code}` }
      ]
    });
    return res.choices[0].message.content;
  } catch (error) {
    console.error("Error with Error Checking:", error);
    return "Sorry, I couldn't check for errors in the code.";
  }
}
