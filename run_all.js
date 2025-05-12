
const { fork } = require('child_process');
const fs = require('fs');
const path = require('path');
const { killChromeProcess } = require('./lib');

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

        const child = fork('./run.js', [name, port]);
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

const main = async (machine, ignore) => {
    try {
        await killChromeProcess().catch(console.error);
        console.log('_____________________________start', machine, ignore);
        const profilePath = path.join(__dirname, 'profile');
        const fileList = readDirectory(profilePath);
        const ignoreList = ignore ? ignore.split(',') : [];
        for (const element of fileList) {
            try {
                const name = element.slice(-4);
                const count = +name - 9220;
                if(ignoreList.includes(count+'')) {
                    console.log('ignore:', count);
                    continue;
                }
                await runTerminal(`${machine}${count}_`, count)
            } catch (error) {
                console.error('Error in runTerminal:', error);
            }
        }
    }
    catch (error) {
        console.error('Error in main:', error);
    }
    setTimeout(() => {
        console.log('_____________________________restart');
        main(machine, ignore);
    }, 10 * 1000);
}

const machine = process.argv[2] || 'w';
const ignore = process.argv[3];
main(machine, ignore)