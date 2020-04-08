require('dotenv').config();
const fs = require('fs');
const Nexmo = require('nexmo');

const NEED_API_KEY = 1;
const NEED_API_SECRET = 2;
const NEED_APP_NAME = 3;
const INPUT_DONE = 4;
var state = NEED_API_KEY;

console.log('Nexmo setup utility for Glitch -- press "q" to exit');
console.log('This utility will need your Nexmo API key and API secret. They will be saved to your .env file,');
console.log('where they will be visible only to you and collaborators on this project.');
console.log('Find your API key and secret at: https://dashboard.nexmo.com/getting-started-guide');

var input = process.stdin;
input.on('data', data => {
  if (data.toString().trim() === 'q') {
    // exit 
    return process.exit();
  }
  if (state === NEED_API_KEY) {
    return setApiKey(data);
  } 
  if (state === NEED_API_SECRET) {
    return setApiSecret(data);
  }
  if (state === NEED_APP_NAME) {
    return createApp(data);
  }
});

// get api key
function getApiKey() {
  console.log('Paste your API key (no spaces, quotes, or extra characters):');
}
getApiKey();

function setApiKey(data) {
  if (data !== '') {
    process.env.API_KEY = data;
    state = NEED_API_SECRET;
    getApiSecret();
  } else {
    getApiKey();
  }
  return true;
}

// get api secret
function getApiSecret() {
  console.log('Paste your API secret (no spaces, quotes, or extra characters):');
}

function setApiSecret(data) {
  if (data !== '') {
    process.env.API_SECRET = data;
    state = NEED_APP_NAME;
    getAppName();
  } else {
    getApiSecret();
  }
  return true;
}

// create application
function getAppName() {
  console.log('Type a name for your app that will uniquely identify it in your Nexmo dashboard:');
}

function createApp(data) {
  if (data !== '') {
    const nexmo = new Nexmo({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      //privateKey: __dirname + '/.data/private.key'
    }, {debug: false});
    nexmo.applications.create(
      data, 
      'rtc', 
      'https://' + process.env.PROJECT_DOMAIN + '.glitch.me/answer', 
      'https://' + process.env.PROJECT_DOMAIN + '.glitch.me/event', 
      {}, 
      (error, response) => {
        if (error) {
          console.log(error);
          process.exit();
        }
        process.env.APP_ID = response.id;
        fs.writeFile(__dirname + '/.data/private.key', response.keys.private_key, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('Private key saved to .data/private.key');
            writeEnv();
          }
        });
      });
    state = INPUT_DONE;
  } else {
    getAppName();
  }
  return true;
}

// save environment variables
function writeEnv() {
  const contents = `DANGEROUSLY_DISABLE_HOST_CHECK=true
API_KEY="${process.env.API_KEY.trim()}"
API_SECRET="${process.env.API_SECRET.trim()}"
APP_ID="${process.env.APP_ID.trim()}"
PRIVATE_KEY="/.data/private.key"`;
  
  fs.writeFile(__dirname + '/.env', contents, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Environment variables saved to .env');
      process.exit();
    }
  });
}
