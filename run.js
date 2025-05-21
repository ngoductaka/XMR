const path = require('path');
const { combineOpenReset } = require('./lib');

const port = process.argv[3] ? parseInt(process.argv[3], 10) : 1;
const name = process.argv[2] ? process.argv[2] : 'e-';
if (isNaN(port) || port < 1024 || port > 65535) {
    console.error('Please provide a valid port number between 1024 and 65535');
    console.log('Usage: node openChrome.js [port]');
    process.exit(1);
}

const main = async (port, name) => {
    console.log('_____________________________Starting process with port:', port);
    const profilePath = path.resolve(__dirname, 'profile', `chrome-profile${port}`);
    await combineOpenReset(port, name, profilePath);
    process.exit(1);
}
main(port, name);