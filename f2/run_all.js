
const { killChromeProcess } = require('../lib');

const { fork } = require('child_process');
const fs = require('fs');
const path = require('path');

function readDirectory(directoryPath) {
    console.log(`Reading files in: ${directoryPath}\n`);

    try {
        // Get all files and directories in the current directory
        const items = fs.readdirSync(directoryPath);

        items.forEach(item => {
            const itemPath = path.join(directoryPath, item);
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                console.log(`📁 Directory: ${item}`);
            } else {
                console.log(`📄 File: ${item} (${(stats.size / 1024).toFixed(2)} KB)`);
            }
        });

        return items;
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return [];
    }
}

const runTerminal = (name, port) => {
    return new Promise((res, rej) => {
        const runPath = path.join(__dirname, 'run.js');
        const child = fork(runPath, [name, port]);
        child.on('close', (code) => {
            console.log(`close_________ ${code}`);
            rej();
        });
        child.on('exit', (code) => {
            console.log(`exit__________ ${code}`);
        });
        child.on('message', (code) => {
            console.log(`message ${code}`);
        });
    });

}

const run = async (machine) => {
    try {
        await killChromeProcess().catch(console.error);
        const profilePath = path.join(__dirname, 'profile');
        const fileList = readDirectory(profilePath);
        // const ignoreList = ignore ? ignore.split(',') : [];
        for (const element of fileList) {
            try {
                const name = element.slice(-4);
                const count = +name - 9220;
                // if(ignoreList.includes(count+'')) {
                //     console.log('ignore:', count);
                //     continue;
                // }
                await runTerminal(`${machine}=${count}`, count);
                await new Promise(resolve => setTimeout(resolve, 3 * 1000));
                await killChromeProcess().catch(console.error);
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 3 * 1000));
                await killChromeProcess().catch(console.error);
                console.error('Error in runTerminal:', error);
            }
        }
    }
    catch (error) {
        console.error('Error in main:', error);
    }
}

const main = async (machine, runInRangeTime = '') => {
    var now = new Date();
    var hour = now.getHours();
    console.log('_____________________________start', machine, runInRangeTime);
    if (runInRangeTime) {
        if (hour >= 0 && hour < 12) {
            await run(machine, runInRangeTime);
        }
    } else {
        await run(machine, runInRangeTime);
    }
    setTimeout(() => {
        console.log('_____________________________restart');
        main(machine, runInRangeTime);
    }, 3 * 60 * 1000);
}

const machine = process.argv[2] || 'w';
const runInRangeTime = process.argv[3];
main(machine, runInRangeTime)