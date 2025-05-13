const {
    openChrome,
    killChromeProcess,
} = require('./lib');
const openProfile = async (port, name) => {
    await killChromeProcess().catch(console.error);
    const profileName = `chrome-profile${port}`;
    openChrome(port, profileName);
    process.exit(0);
}
const main = async (port, name) => {
    console.log('_____________________________Starting process with port:', port);
    await openProfile(port, name);

}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
const port = parseInt((9220 + count), 10);

main(port);
