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
    exec(remoteDebugCmd, (error) => {
        if (error) {
            console.error(`Error launching Chrome: ${error.message}`);
        } else {
            console.log('Chrome launched with remote debugging');
        }
        console.log('Chrome launched with remote debugging');
    });
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Chrome launched with remote debugging');
            resolve();
        }
            , 3000)
    }
    );
    process.exit(0);
}

const port = 9220 + parseInt(process.argv[2], 10) || 1;

const profilePath = path.join(__dirname, 'profile', `chrome-profile${port}`);
openChrome(port, profilePath);