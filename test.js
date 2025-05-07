const puppeteer = require('puppeteer');
const {
    openChrome,
    waitForClassToExist,
    openOldConnection,
    clickCMD,
    clickCMD_
} = require('./lib');

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
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:' + port,
        defaultViewport: null,
    });

    // Open a new tab (page)


    const page = await browser.newPage();
    await page.goto("https://idx-react4-1746439876356.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev/?folder=/home/user/react4");
    await page.waitForSelector('.menubar-menu-button', { timeout: 5000 });
    await page.click('.menubar-menu-button');

    await page.waitForSelector('div.menubar-menu-items-holder', { timeout: 5000 });
    try {
        await page.waitForSelector('.action-label[aria-label="Terminal"]', { timeout: 5000 });
        await page.click('.action-label[aria-label="Terminal"]');
    } catch (err) {
        console.error('Error clicking on Terminal:', err);
    }
    try {
        await page.waitForSelector('.action-label[aria-label="New Terminal"]', { timeout: 5000 });
        await page.click('.action-label[aria-label="New Terminal"]');
    } catch (err) {
        console.error('Error clicking on Terminal or New Terminal:', err);
    }

    console.log('Clicked on "New Terminal"');
    await new Promise(resolve => setTimeout(resolve, 3 * 1000));

    const dnd = await page.$$('.xterm-link-layer').catch((err) => { });
    console.log('dnd', dnd);
    await page.waitForSelector('.xterm-link-layer', { timeout: 10 * 1000 });
    const textToType = 'echo "Hello from automated terminal"'; // Replace with your desired command
    await page.type('.xterm-helper-textarea', textToType);
    console.log('Typed text:', textToType);

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




}
const main = async () => {
    openChrome(port)
    // .catch(err => {
    //     console.error('Failed to start Chrome:', err)
    //     openChrome(port)
    //     setTimeout(() => {
    //         console.log('Chrome opened successfully');
    //         runReset(port)
    //     }, 2000);
    // });
    setTimeout(() => {
        console.log('Chrome opened successfully');
        runReset(port);
    }, 2000);
}
main();
