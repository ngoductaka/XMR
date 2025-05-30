
const {
    openChrome,
    initConnection,
    runCMD,
    waitForClassToExist,
    openOldConnection,
    clickCMD,
    runRestartScript, } = require('./lib');

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
const port = parseInt((9220 + count), 10);
const name = process.argv[3] ? process.argv[3] : 'm1_';

// Validate port is a number and in valid range
if (isNaN(port) || port < 1024 || port > 65535) {
    console.error('Please provide a valid port number between 1024 and 65535');
    console.log('Usage: node openChrome.js [port]');
    process.exit(1);
}

const create = async (port, i) => {
    try {
        // openChrome(port);
        const page = await initConnection(port, i);
        await page.waitForSelector('iframe.is-loaded', { timeout: 10 * 60 * 1000 });
        console.log('________done waiting for selector___________________________');
        // const classFound = await waitForClassToExist(page, '.is-loaded');
        // if (!classFound) {
        //     console.log('Class not found, exiting...');
        //     await browser.close();
        //     return;
        // }
        // await clickCMD(page, i);
        // await page.keyboard.press('Enter');
        // console.log('Text typed into currently focused element');

    } catch (error) {
        console.error('Error killing Chrome:', error);
    }
}

const run10 = async (port) => {
    for (let i = 0; i < 10; i++) {
        await create(port, name + i);
    }
}

const main = async () => {
    const profileName = `chrome-profile${port}`;
    openChrome(port, profileName)
    setTimeout(() => {
        console.log('Chrome opened successfully');
        run10(port);
    }, 2000);
}
main();