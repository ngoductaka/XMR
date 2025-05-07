
const {
    openChrome,
    waitForClassToExist,
    openOldConnection,
    clickCMD, } = require('./lib');

const port = process.argv[2] ? parseInt(process.argv[2], 10) : 9224;

// Validate port is a number and in valid range
if (isNaN(port) || port < 1024 || port > 65535) {
    console.error('Please provide a valid port number between 1024 and 65535');
    console.log('Usage: node openChrome.js [port]');
    process.exit(1);
}


const reset = async (browser, link, i) => {
    const location = link.split('/');
    const page = await browser.newPage();
    await page.goto(link);
    const classFound = await waitForClassToExist(page, '.is-loaded');
    if (!classFound) {
        console.log('Class not found, exiting...');
        await browser.close();
        return;
    }
    await page.waitForSelector('iframe.is-loaded');
    console.log('name_', location[location.length - 1]);
    await clickCMD(page, location[location.length - 1]);
    await page.close();
    // await page.keyboard.press('Enter');
    console.log('Text typed into currently focused element');
}
const runReset = async (port) => {
    const { browser, page, mainTargetLinks } = await openOldConnection(port);
    mainTargetLinks.reverse();
    for (const link of mainTargetLinks) {
        await reset(browser, link.href);
    }

}
const main = async () => {
    openChrome(port)
        .catch(err => {
            console.error('Failed to start Chrome:', err)
            openChrome(port)

            setTimeout(() => {
                console.log('Chrome opened successfully');
                runReset(port)
            }, 2000);
        });
    setTimeout(() => {
        console.log('Chrome opened successfully');
        runReset(port);
    }, 2000);
}
main();