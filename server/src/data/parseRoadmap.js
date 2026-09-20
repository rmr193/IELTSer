'use strict';

const fs = require('fs');
const path = require('path');

const PHASES = [
  {
    id: 1,
    name: 'Foundation',
    startDay: 1,
    endDay: 15,
    band: '4.5 – 5.0',
    goal: 'Foundation, Grammar, Core Vocabulary & Habit Building',
  },
  {
    id: 2,
    name: 'Question Formats & Core Strategies',
    startDay: 16,
    endDay: 30,
    band: '5.0 – 5.5',
    goal: 'Question Formats, Core Strategies & Analytical Frameworks',
  },
  {
    id: 3,
    name: 'Targeted Skill Drills',
    startDay: 31,
    endDay: 50,
    band: '5.5 – 6.5',
    goal: 'Targeted Skill Drills, Speed Tactics & Complex Questions',
  },
  {
    id: 4,
    name: 'Timed Sections & Stamina',
    startDay: 51,
    endDay: 70,
    band: '6.5 – 7.5',
    goal: 'Timed Sections, Stamina Building & Band 8+ Polish',
  },
  {
    id: 5,
    name: 'Full Mock Tests & Error Autopsy',
    startDay: 71,
    endDay: 84,
    band: '7.5 – 8.0',
    goal: 'Full Cambridge Mock Tests & Comprehensive Error Autopsy',
  },
  {
    id: 6,
    name: 'Peak Performance & Exam Readiness',
    startDay: 85,
    endDay: 90,
    band: '8.0 – 8.5+',
    goal: 'Peak Performance, Speed Runs, Confidence & Exam Readiness',
  },
];

function getPhase(day) {
  return PHASES.find((p) => day >= p.startDay && day <= p.endDay).id;
}

function detectSkill(title, desc) {
  const t = title.toLowerCase();
  const d = desc.toLowerCase();

  // Explicit title prefixes or keywords
  if (/^listening\b|ear training|audio|dictation|podcast|monologue|lecture|accent training|shadowing practice|audio shadowing/i.test(t)) return 'listening';
  if (/^reading\b|skim reading|passage|t\/f\/ng|true\/false|yes\/no|matching headings|comprehension/i.test(t)) return 'reading';
  if (/^writing\b|essay|task 1|task 2|typing drill|typing stamina|transcribe|report writing|writing surgery/i.test(t)) return 'writing';
  if (/^speaking\b|oral|pronunciation|cue card|interview|intonation|speech|fluency|talk to yourself/i.test(t)) return 'speaking';
  if (/grammar|vocab|vocabulary|word|collocation|tense|clauses|idiom|lexical|flashcard|linking words/i.test(t)) return 'language';

  // Specific phrases
  if (/\b(listen|listening|audio|podcast|dictation|accent)\b/i.test(t)) return 'listening';
  if (/\b(read|reading|passage|skimming|scanning|comprehension)\b/i.test(t)) return 'reading';
  if (/\b(writ|writing|essay|transcribe|typing)\b/i.test(t)) return 'writing';
  if (/\b(speak|speaking|pronunciation|oral|fluency)\b/i.test(t)) return 'speaking';
  if (/\b(grammar|vocab|vocabulary|words|collocation|tenses)\b/i.test(t)) return 'language';

  // In description
  if (/\b(listen|listening|audio|podcast)\b/i.test(d) && !/\b(speak|record yourself)\b/i.test(d)) return 'listening';
  if (/\b(read|reading passage|article)\b/i.test(d) && !/\b(aloud|speak)\b/i.test(d)) return 'reading';
  if (/\b(write|essay|task 1|task 2|type|typing)\b/i.test(d) && !/\b(speak|record)\b/i.test(d)) return 'writing';
  if (/\b(speak|record yourself|pronounce|aloud)\b/i.test(d)) return 'speaking';

  return 'language';
}

function detectMinutes(desc) {
  const hourM = desc.match(/(\d+)\s*(?:hours?|hrs?|h\b)/i);
  const minM = desc.match(/(\d+)\s*(?:minutes?|mins?|m\b)/i);

  if (hourM && minM) return parseInt(hourM[1], 10) * 60 + parseInt(minM[1], 10);
  if (minM) {
    const val = parseInt(minM[1], 10);
    if (val >= 5 && val <= 180) return val;
  }
  if (hourM) {
    const val = parseInt(hourM[1], 10);
    if (val <= 3) return val * 60;
    return 30; // for 8 hours sleep etc.
  }
  return 30;
}

function parseRoadmap(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dayBlocks = content.split(/### Day (\d+):\s*([^\n]+)/);
  let taskNumber = 1;
  const allTasks = [];

  for (let i = 1; i < dayBlocks.length; i += 3) {
    const dayNum = parseInt(dayBlocks[i], 10);
    const dayTitle = dayBlocks[i + 1].trim();
    const body = dayBlocks[i + 2];

    const tipMatch = body.match(/> 💡\s*\*([^\*]+)\*/);
    const dayTip = tipMatch ? tipMatch[1].trim() : '';

    const taskRegex = /- \[[ x]\] \*\*Task (\d+):\s*([^\*:]+):?\*\*:?\s*([^\n]+)/g;
    let tm;
    let order = 1;
    while ((tm = taskRegex.exec(body)) !== null) {
      const title = tm[2].trim();
      const desc = tm[3].trim();
      const skill = detectSkill(title, desc);
      const minutes = detectMinutes(desc);

      allTasks.push({
        number: taskNumber++,
        day: dayNum,
        order: order++,
        phase: getPhase(dayNum),
        skill,
        title,
        description: desc,
        minutes,
        dayTitle,
        dayTip,
      });
    }
  }

  return allTasks;
}

function run() {
  const roadmapPath = path.resolve(__dirname, '../../../IELTS_90_Days_Roadmap.md');
  if (!fs.existsSync(roadmapPath)) {
    throw new Error('Could not find IELTS_90_Days_Roadmap.md at ' + roadmapPath);
  }

  const tasks = parseRoadmap(roadmapPath);
  const outputPath = path.resolve(__dirname, 'tasks.json');
  fs.writeFileSync(outputPath, JSON.stringify(tasks, null, 2), 'utf8');
  console.log(`Successfully parsed ${tasks.length} tasks and saved to ${outputPath}`);
}

if (require.main === module) {
  run();
}

module.exports = { PHASES, parseRoadmap };
