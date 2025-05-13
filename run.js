const { exec } = require('child_process');
const {
    openChrome,
    openOldConnection,
    resetWithLink,
    closeAllTabs,
    sendTelegramMessage,
} = require('./lib');
// Define your bot token and chat ID
const TELEGRAM_BOT_TOKEN = '7668129713:AAGGfomtEre-W2QH0r1FUPL1Z9pKSd0KMlQ';
const TELEGRAM_CHAT_ID = '1140704410';

const count = process.argv[3] ? parseInt(process.argv[3], 10) : 1;
// console.log('_____________________________count:', count);
const port = parseInt((9220 + count), 10);
const name = process.argv[2] ? process.argv[2] : 'e-';

// Validate port is a number and in valid range
if (isNaN(port) || port < 1024 || port > 65535) {
    console.error('Please provide a valid port number between 1024 and 65535');
    console.log('Usage: node openChrome.js [port]');
    process.exit(1);
}


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
        }, 10 * 1000);
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
        await page.waitForSelector('iframe.is-loaded', { timeout: 1 * 60 * 1000 });
        await page.close();
    } catch (error) {
        console.error('Error Create:', error);
        throw Error(error);
    }
}
const checkDie = async (page, port, name) => {
    try {
        const errorMessage = await page.evaluate(() => {
            const errorSection = document.querySelector('.error-section.callout.severity-error.is-loud');
            if (errorSection) {
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
        // create
        // Error opening workspace: We've detected suspicious activity on one of your workspaces. Please contact 
        if (mainTargetLinks.length < 10) {
            for (let i = mainTargetLinks.length; i < 10; i++) {
                await create(page, `${name}_${i}_`);
            }
        }

        await closeAllTabs(browser, true)
        // reset
        mainTargetLinks.reverse();
        for (const link of mainTargetLinks) {
            console.log('open link:', link.href);
            await page.goto(link.href);
            await new Promise(resolve => setTimeout(resolve, 10 * 1000));
            const isDie = await checkDie(page, port, name);
            if (isDie) {
                await closeAllTabs(browser)
                console.log('isDie:', isDie);
                throw new Error('isDie');
            }
        }
        // page.close();
        for (const link of mainTargetLinks) {
            await reset(browser, link.href).catch(() => reset(browser, link.href).catch());
        }
        await closeAllTabs(browser)
    } catch (error) {
        console.error('Error in runJob:', error);
    }
}
const combineOpenReset = async (port, name) => {
    return new Promise((resolve, reject) => {
        const profileName = `chrome-profile${port}`;
        // await killChromeProcess(profileName)
        openChrome(port, profileName)
        setTimeout(() => {
            console.log('_____________________________combineOpenReset with port:', port);
            runJob(port, name).finally(() => {
                reject();
            })
        }, 2000);
    });
}
const main = async (port, name) => {
    console.log('_____________________________Starting process with port:', port);
    await combineOpenReset(port, name);
    process.send('done');
    // setInterval(() => {
    //     combineOpenReset(port, name);
    // }, 1000 * 60 * 60);
}
main(port, name);

module.exports = {
    runJob,
    reset,
    create,
    combineOpenReset
}
//     // }
