'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require("express-session");
const passport = require("passport");
const app = express();
const ObjectID = require('mongodb').ObjectID;
const mongo = require('mongodb').MongoClient;
require('dotenv').config()
fccTesting(app); //For FCC testing purposes

const cors = require('cors');
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

console.log(`*** database url : ${process.env.DATABASE} ***`);

// connect to mongo database
mongo.connect(process.env.DATABASE, (err, db) => {
  if (err) {
    console.log('Database error: ' + err);
  } else {
    console.log('Successful database connection');

    //serialization
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });


    passport.deserializeUser((id, done) => {
      db.collection('users').findOne(
        { _id: new ObjectID(id) },
        (err, doc) => {
          done(null, doc);
        }
      );
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
app.route('/')
  .get((req, res) => {
    res.render(process.cwd() + '/views/pug/index', { title: 'Hello', message: 'Please login' });
  });