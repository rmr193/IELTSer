'use strict';

const fs = require('fs');
const path = require('path');
const { PHASES, parseRoadmap } = require('./parseRoadmap');

const tasksJsonPath = path.resolve(__dirname, 'tasks.json');
const roadmapPath = path.resolve(__dirname, '../../../IELTS_90_Days_Roadmap.md');

function buildTasks() {
  if (fs.existsSync(tasksJsonPath)) {
    try {
      const data = fs.readFileSync(tasksJsonPath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read tasks.json, falling back to parser:', e.message);
    }
  }

  if (fs.existsSync(roadmapPath)) {
    return parseRoadmap(roadmapPath);
  }

  throw new Error('Neither tasks.json nor IELTS_90_Days_Roadmap.md was found.');
}

module.exports = {
  PHASES,
  buildTasks,
};
