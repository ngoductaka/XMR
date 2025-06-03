
const { runAllProfile } = require('../lib');
const path = require('path');

const main = async (machine, runInRangeTime = '') => {
    var now = new Date();
    var hour = now.getHours();
    const startTime = Date.now();
    console.log(hour, '_____________________________runInRangeTime == 2 && hour > 12', runInRangeTime == 2 && hour > 12);
    console.log(hour, '_____________________________runInRangeTime == 1 && hour < 12:', runInRangeTime == 1 && hour < 12);
    if (runInRangeTime == 1 && hour < 12) {
        await runAllProfile(machine, __dirname);
    } else if (runInRangeTime == 2 && hour > 12) {
        await runAllProfile(machine, __dirname);
    } else {
        await runAllProfile(machine, __dirname);
    }
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / (60 * 1000); // Convert to seconds
    console.log(`_____________________________finished in ${executionTime.toFixed(2)} minute`);
}

const machine = process.argv[2] || 'w';
const runInRangeTime = process.argv[3];
main(machine, runInRangeTime)