const { combineOpenReset } = require('./run');
const { exec } = require('child_process');

const runProcessPro = (command) => {
    return new Promise((res, rej) => {
        exec(command, (error) => {
            if (error) {
                console.error(`___________________Error: ${command} ${error.message}`);
                rej(error);
            } else {
                console.error(`___________________SS: ${command}`);
                res();
            }
        });
    })
}


const runProcess = (command) => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`___________________Error: ${error.message}`);
            setTimeout(() => {
                console.log('_________________Retrying command:', command);
                runProcess(command);
            }, 1000 * 60 * 10);
        }
        setTimeout(() => {
            console.log('_________________Retrying command:', command);
            runProcess(command);
        }, 1000 * 60 * 40);
        if (stderr) {
            console.error(`__________________stderr: ${stderr}`);
        }
        if (stdout) {
            console.log(`__________________stdout: ${stdout}`);
        }
    });
}


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

const main = async () => {
    const profilePath = path.join(__dirname, 'profile');
    const fileList = readDirectory(profilePath);
    console.log(fileList);
    exec(`yarn m${1}`)
    // await runProcessPro(`yarn m${1}`)
    // for (const element of fileList) {
    //     const name = element[element.length - 1];
    //     // setTimeout(() => {
    //     //     console.log(`node run.js ${name} w_${name}`);
    //     //     runProcess(`node run.js ${name} w_${name}`)
    //     // }, 1000 * 60 * 20 * (name-1));

    //     // console.log(`runProcess: w_${name}`);
    //     // await combineOpenReset(name, `w_${name}`);
    //     // console.log(`doneProcess: w_${name}`);

    //     // await runProcessPro(`node run.js ${name} w_${name}`)
    //     await runProcessPro(`yarn m${name}`)
    // }
    // for (let i = 1; i < 5; i++) {
    //     setTimeout(() => {
    //         runProcess(`node run.js ${i} w_${i}`)
    //     }, 1000 * i);
    // }
}
main()