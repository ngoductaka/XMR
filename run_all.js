
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

const main = async (machine, reverse) => {
    try {
        await killChromeProcess().catch(console.error);
        console.log('_____________________________start', machine, reverse);
        const profilePath = path.join(__dirname, 'profile');
        const fileList = readDirectory(profilePath);
        if (reverse) {
            fileList.reverse();
        }
        console.log(fileList);
        for (const element of fileList) {
            try {
                // const name = element[element.length - 1];
                const name = element.slice(-4);
                const count = +name - 9220;
                console.log('_____________________________count:', count);
                await runTerminal(`${machine}${count}_`, count)
                await killChromeProcess().catch(console.error);
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
        main(machine, reverse);
    }, 1000);
}

const machine = process.argv[2] || 'w';
const reverse = process.argv[3] ? true : false;
main(machine, reverse)