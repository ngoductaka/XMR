
const { fork } = require('child_process');
const path = require('path');

const runTerminal = (runPath, name) => {
    return new Promise((res, rej) => {
        const child = fork(runPath, [name]);
        child.on('close', (code) => {
            console.log(`close_________ ${code}`);
            res();
        });
        child.on('exit', (code) => {
            console.log(`exit__________ ${code}`);
            res();
        });
        child.on('message', (code) => {
            console.log(`message ${code}`);
        });
    });

}

const main = async (machine) => {
    runTerminal(path.join(__dirname, 'run.js'), machine)
        .finally(() => {
            console.log('finally');
            setTimeout(() => {
                console.log('restart');
                main(machine);
            }, 5 * 1000);
        });

}

const machine = process.argv[2] || 'w';
main(machine)