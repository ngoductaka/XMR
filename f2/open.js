const path = require('path');
const { openChrome } = require('../lib');

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
const port = parseInt((9320 + count), 10);
if (isNaN(port) || port < 1024 || port > 65535) {
    console.error('Please provide a valid port number between 1024 and 65535');
    console.log('Usage: node openChrome.js [port]');
    process.exit(1);
}

const main = async (port) => {
    const profilePath = path.resolve(__dirname, 'profile', `chrome-profile${port}`);
    openChrome(port, profilePath)
    process.exit('done');
}
main(port);