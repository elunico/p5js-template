const { parse } = require('node-html-parser');
const { readFileSync, writeFileSync, readdir, copyFileSync, stat, existsSync, fstatSync, mkdirSync } = require('fs');
const path = require('path');

const destination = process.argv[2];
if (!destination) {
  throw new Error("Must specify destination folder in CWD as argument");
}

const version = process.argv[3];

async function getCDNLink() {
  try {
    if (version) {
      console.warn(`CUSTOM VERSION! Requesting p5 version ${version}. If this does not exist you will not see an error until you load the sketch!`);
      theUrl = new URL(`https://cdn.jsdelivr.net/npm/p5@${version}/lib/p5.js`);
    }
    else {
      console.log("Using latest CDN p5 version. Pass version after directory to specify");
      theUrl = new URL(`https://cdn.jsdelivr.net/npm/p5/lib/p5.js`);
    }
  } catch {
    theUrl = new URL(`https://cdn.jsdelivr.net/npm/p5/lib/p5.js`);
  }
  return theUrl;
}

getCDNLink().then(url => {

  if (existsSync(destination)) {
    throw new Error(`Destination ${destination} already exists!`);
  } else {
    mkdirSync(destination);
  }

  let text = readFileSync(path.join(__dirname, 'resources', 'index.html-template')).toString();
  text = text.replace('%{{link}}', url.toString());
  writeFileSync(path.join(__dirname, 'resources', 'index.html'), text);

  readdir(path.join(__dirname, 'resources'), (err, files) => {
    if (err) {
      console.error("Could not load resource files! ");
      console.error(err);
      return;
    }

    for (let file of files) {
      if (!file.endsWith('template')) {
        copyFileSync(path.join(__dirname, 'resources', file), path.join(process.cwd(), destination, file));
      }
    }
  });
}).catch(err => console.error(err));
