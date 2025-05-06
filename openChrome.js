const { openChrome } = require('./lib');
const port = process.argv[2] ? parseInt(process.argv[2], 10) : 9224;

// Validate port is a number and in valid range
if (isNaN(port) || port < 1024 || port > 65535) {
    console.error('Please provide a valid port number between 1024 and 65535');
    console.log('Usage: node openChrome.js [port]');
    process.exit(1);
}

console.log(`Opening Chrome with remote debugging on port ${port}`);
openChrome(port)
    .then(() => console.log('Chrome started successfully'))
    .catch(err => console.error('Failed to start Chrome:', err));