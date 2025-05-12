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
main(port, name);

module.exports = {
    runJob,
    reset,
    create,
    combineOpenReset
}
//     // }
