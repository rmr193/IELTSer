// Sanity-check the curriculum without a database:  npm run verify
const { PHASES, buildTasks } = require('./curriculum');

const tasks = buildTasks();
const days = new Set(tasks.map((t) => t.day));
const perPhase = PHASES.map((p) => tasks.filter((t) => t.phase === p.id).length);

console.log('Phases        :', PHASES.length);
console.log('Days          :', days.size);
console.log('Total tasks   :', tasks.length);
console.log('Tasks/phase   :', perPhase.join(', '));

if (PHASES.length !== 6 || days.size !== 90 || tasks.length !== 449) {
  console.error('Curriculum check FAILED');
  process.exit(1);
}
console.log('Curriculum check passed: 6 phases, 90 days, 449 tasks.');
