const { exec } = require('child_process');

const runProcess = (command) => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`___________________Error: ${error.message}`);
            setTimeout(() => {
                console.log('_________________Retrying command:', command);
                runProcess(command);
            }, 1000 * 60 * 10);
        }
        if (stderr) {
            console.error(`__________________stderr: ${stderr}`);
        }
        if (stdout) {
            console.log(`__________________stdout: ${stdout}`);
        }
    });
}

const main = async () => {
    for (let i = 1; i < 4; i++) {
        setTimeout(() => {
            runProcess(`node run.js ${i} w_${i}`)
        }, 1000 * i);
    }
}
main()