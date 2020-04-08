// server.js
// where your node app starts

require('dotenv').config();

// init server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// create a Nexmo client
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  applicationId: process.env.APP_ID,
  privateKey: __dirname + process.env.PRIVATE_KEY 
}, {debug: true});

// the client calls this endpoint to request a JWT, passing it a username
app.post('/getJWT', function(req, res) {
  const jwt = nexmo.generateJwt({
    application_id: process.env.APP_ID,
    sub: req.body.name,
    exp: Math.round(new Date().getTime()/1000)+3600,
    acl: {
      "paths": {
        "/v1/users/**":{},
        "/v1/conversations/**":{},
        "/v1/sessions/**":{},
        "/v1/devices/**":{},
        "/v1/image/**":{},
        "/v3/media/**":{},
        "/v1/applications/**":{},
        "/v1/push/**":{},
        "/v1/knocking/**":{}
      }
    }
  });
  res.send({jwt: jwt});
});

// the client calls this endpoint to get a list of all users in the Nexmo application
app.get('/getUsers', function(req, res) {
  const users = nexmo.users.get({}, (err, response) => {
    if (err) {
      res.sendStatus(500);
    } else {
      let realUsers = response.filter(user => user.name.substring(0,4) !== 'NAM-');
      res.send({users: realUsers});
    }
  });
});

// the client calls this endpoint to create a new user in the Nexmo application,
// passing it a username and optional display name
app.post('/createUser', function(req, res) {
  nexmo.users.create({
    name: req.body.name,
    display_name: req.body.display_name || req.body.name
  },(err, response) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send({id: response.id});
    }
  });
});

// listen for requests :)
app.listen(3001);
