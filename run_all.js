
const { runAllProfile, killChromeProcess } = require('./lib');
const path = require('path');

const main = async (machine, runInRangeTime = '') => {
    await killChromeProcess().catch(console.error);
    var now = new Date();
    var hour = now.getHours();
    const profilePath = path.join(__dirname, 'profile');
    const runPath = path.join(__dirname, 'run.js');
    console.log('_____________________________start', new Date().toLocaleTimeString());
    if (runInRangeTime) {
        if (hour >= 0 && hour < 12) {
            await runAllProfile(machine, profilePath, runPath);
        }
    } else {
        await runAllProfile(machine, profilePath, runPath);
    }
    setTimeout(() => {
        console.log('_____________________________restart', new Date().toLocaleTimeString());
        main(machine, runInRangeTime);
    }, 5 * 1000);
}

const machine = process.argv[2] || 'w';
const runInRangeTime = process.argv[3];
main(machine, runInRangeTime)