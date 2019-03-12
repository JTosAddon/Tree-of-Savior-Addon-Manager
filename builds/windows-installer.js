const winstaller = require('electron-winstaller');

if (process.argv.length < 3) {
  console.log('Missing parameter.');
  return;
}

const exeName = process.argv[2];

console.log(`Creating ${exeName} ...`)

winstaller.createWindowsInstaller({
  appDirectory: `./dist/${exeName}-win32-ia32`,
  outputDirectory: `./dist/installer/${exeName}`,
  authors: 'Excrulon',
  exe: `${exeName}.exe`,
  noMsi: true
})
.then(() => console.log('Done!'))
.catch(e => console.log(e.message));