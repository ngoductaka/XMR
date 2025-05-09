
const { fork } = require('child_process');

// const runProcessPro = (command) => {
//     return new Promise((res, rej) => {
//         exec(command, (error) => {
//             if (error) {
//                 console.error(`___________________Error: ${command} ${error.message}`);
//                 rej(error);
//             } else {
//                 console.error(`___________________SS: ${command}`);
//                 res();
//             }
//         });
//     })
// }


// const runProcess = (command) => {
//     exec(command, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`___________________Error: ${error.message}`);
//             setTimeout(() => {
//                 console.log('_________________Retrying command:', command);
//                 runProcess(command);
//             }, 1000 * 60 * 10);
//         }
//         setTimeout(() => {
//             console.log('_________________Retrying command:', command);
//             runProcess(command);
//         }, 1000 * 60 * 40);
//         if (stderr) {
//             console.error(`__________________stderr: ${stderr}`);
//         }
//         if (stdout) {
//             console.log(`__________________stdout: ${stdout}`);
//         }
//     });
// }


// const fs = require('fs');
// const path = require('path');

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

const runTerminal = (port, name) => {
    return new Promise((res, rej) => {
        const child = fork('./run.js', [port, name]);
        child.on('close', (code) => {
            console.log(`close_________ ${code}`);
        });
        child.on('exit', (code) => {
            console.log(`exit__________ ${code}`);
        });
        child.on('message', (code) => {
            console.log(`message ${code}`);
        });
    });

}

const main = async () => {
    const profilePath = path.join(__dirname, 'profile');
    const fileList = readDirectory(profilePath);
    console.log(fileList);
    for (const element of fileList) {
        const name = element[element.length - 1];
        await runTerminal(name, 'w_' + name).catch(console.error);
    }
    setTimeout(() => {
        main();
    }, 1000 * 60 * 30);
}
main()