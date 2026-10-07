const { performance } = require('perf_hooks');

const NUM_PROJECTS = 50000;
const NUM_SELECTED = 10000;

const projects = [];
const selected = [];

for (let i = 0; i < NUM_PROJECTS; i++) {
    projects.push({ id: `proj_${i}`, name: `Project ${i}` });
}

for (let i = 0; i < NUM_SELECTED; i++) {
    selected.push(`proj_${Math.floor(Math.random() * NUM_PROJECTS)}`);
}

function benchArrayIncludes() {
    const start = performance.now();
    for (let iter = 0; iter < 10; iter++) {
        const selectedProjects = projects.filter((p) => selected.includes(p.id));
    }
    const end = performance.now();
    return end - start;
}

function benchSetHas() {
    const start = performance.now();
    for (let iter = 0; iter < 10; iter++) {
        const selectedSet = new Set(selected);
        const selectedProjects = projects.filter((p) => selectedSet.has(p.id));
    }
    const end = performance.now();
    return end - start;
}

console.log(`Running Array.includes...`);
const arrayTime = benchArrayIncludes();
console.log(`Array.includes: ${arrayTime.toFixed(2)}ms`);

console.log(`Running Set.has...`);
const setTime = benchSetHas();
console.log(`Set.has: ${setTime.toFixed(2)}ms`);

const improvement = ((arrayTime - setTime) / arrayTime) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}%`);
