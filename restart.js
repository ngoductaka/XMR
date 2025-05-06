const {
    openChrome,
    initConnection,
    runCMD,
    waitForClassToExist
} = require('./lib');


const main = async() => {
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
    
}