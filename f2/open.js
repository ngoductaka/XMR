const { exec } = require('child_process');
const path = require('path');

const openChrome = async (port, profilePath) => {
    let remoteDebugCmd = ''
    if (process.platform === 'win32') {
        const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        remoteDebugCmd = `"${chromePath}" --remote-debugging-port=${port} --user-data-dir="${profilePath}"`;
    } else {
        const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        remoteDebugCmd = `"${chromePath}" --remote-debugging-port=${port} --user-data-dir="${profilePath}"`;
    }
    return new Promise((resolve, reject) => {
        console.log('Executing:', remoteDebugCmd);
        exec(remoteDebugCmd, (error) => {
            if (error) {
                console.error(`Error launching Chrome: ${error.message}`);
                reject(error);
            } else {
                console.log('Chrome launched with remote debugging');
                resolve();
            }
            console.log('Chrome launched with remote debugging');
        });
    });
}

const port = 9320 + parseInt(process.argv[2], 10) || 1;


const profilePath = path.join(__dirname, 'profile', `chrome-profile${port}`);
openChrome(port, profilePath);