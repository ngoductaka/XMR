const { exec } = require('child_process');
const {
    openChrome,
    openOldConnection,
    resetWithLink,
    closeAllTabs
} = require('./lib');

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
const port = parseInt((9220 + count), 10);
const name = process.argv[3] ? process.argv[3] : 'm1_';

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
        await page.waitForSelector('iframe.is-loaded', { timeout: 2 * 60 * 1000 });
        await page.close();
    } catch (error) {
        console.error('Error Create:', error);
        throw error;
    }
}

const runJob = async (port, name) => {
    try {
        const { browser, page, mainTargetLinks } = await openOldConnection(port);
        // create
        if (mainTargetLinks.length < 10) {
            for (let i = mainTargetLinks.length; i < 10; i++) {
                await create(page, name + i).catch();
            }
        }

        // await closeAllTabs(browser, true)
        // reset
        mainTargetLinks.reverse();
        for (const link of mainTargetLinks) {
            console.log('open link:', link.href);
            await page.goto(link.href);
            await new Promise(resolve => setTimeout(resolve, 10 * 1000));
        }
        page.close();
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
    combineOpenReset(port, name);
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
