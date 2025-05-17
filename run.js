const { openChrome, runJobWithSelenium } = require('./lib');
const path = require('path');

const count = process.argv[3] ? parseInt(process.argv[3], 10) : 1;
const port = parseInt((9220 + count), 10);
const name = process.argv[2] || `dnd`;
const profilePath = path.join(__dirname, 'profile', `chrome-profile${port}`);

// Main execution function
async function main() {
    try {
        console.log(`Starting Selenium test with port ${port} and name ${name}`);
        openChrome(port, profilePath);
        setTimeout(async () => {
            console.log('Running job with Selenium...');
            await runJobWithSelenium(port, name);
            process.exit('done');
        }, 2 * 1000);
    } catch (error) {
        console.error('Error running Selenium test:', error);
    }
}
// Run the main function
main();
