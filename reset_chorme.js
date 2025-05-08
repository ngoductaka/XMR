
const {
    openChrome,
    waitForClassToExist,
    openOldConnection,
    clickCMD,
    resetWithLink,
    killChromeProcess
} = require('./lib');

const port = process.argv[2] ? parseInt(process.argv[2], 10) : 9224;

// Validate port is a number and in valid range
if (isNaN(port) || port < 1024 || port > 65535) {
    console.error('Please provide a valid port number between 1024 and 65535');
    console.log('Usage: node openChrome.js [port]');
    process.exit(1);
}


const reset = async (browser, link) => {
    const location = link.split('/');
    const page = await browser.newPage();
    await page.goto(link);
    await page.waitForSelector('iframe.is-loaded', { timeout: 10 * 60 * 1000 });
    const iframeSrc = await page.evaluate(() => {
        const iframe = document.querySelector('iframe.is-loaded');
        return iframe ? iframe.src : null;
    });
    console.log('Iframe source URL:________________', iframeSrc);
    await resetWithLink(page, iframeSrc, location[location.length - 1]).catch(async (err) => {
        console.error('Error resetting with link::________________dnd____', err);
        await resetWithLink(page, iframeSrc, location[location.length - 1])
    });
    console.log('done___________________________and closing page in 100 seconds');
    setTimeout(async () => {
        await page.close();
        console.log('Page closed___________________________');
    }, 100 * 1000);
}

const runReset = async (port) => {
    const { browser, page, mainTargetLinks } = await openOldConnection(port);
    mainTargetLinks.reverse();
    for (const link of mainTargetLinks) {
        await reset(browser, link.href).catch(err => {
            console.error('Error resetting with link:', err);
            reset(browser, link.href)
        });
    }

}
const main = async () => {
    // await killChromeProcess(`chrome-profile${port}`);
    openChrome(port)
        .catch(err => {
            console.error('Failed to start Chrome:', err)
            openChrome(port)

            setTimeout(() => {
                console.log('Chrome opened successfully1');
                runReset(port)
            }, 2000);
        });
    setTimeout(() => {
        console.log('Chrome opened successfully2');
        runReset(port);
    }, 2000);
}
main();