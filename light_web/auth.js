'use strict';

const express = require('express');
const hash = require('pbkdf2-password')();
const session = require('express-session');
const db = require('./db');

const router = express.Router();

router.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'shhhh, very secret'
}));

router.use(function (req, res, next) {
  const err = req.session.error;
  const msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

function authenticate(username, password, fn) {
  const user = db.findUser(username);
  if (!user) return fn(null, null);
  hash({ password, salt: user.salt }, function (err, pass, salt, h) {
    if (err) return fn(err);
    if (h === user.hash) return fn(null, user);
    fn(null, null);
  });
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/auth/login');
  }
}

router.get('/', function (req, res) {
  res.redirect('/auth/login');
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  if (!req.body) return res.sendStatus(400);
  authenticate(req.body.username, req.body.password, function (err, user) {
    if (err) return next(err);
    if (user) {
      req.session.regenerate(function () {
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.username
          + ' click to <a href="/auth/logout">logout</a>.'
          + ' You may now access <a href="/auth/restricted">/auth/restricted</a>.';
        res.redirect('/auth/login');
      });
    } else {
      req.session.error = 'Authentication failed, please check your username and password.';
      res.redirect('/auth/login');
    }
  });
});

router.get('/register', function (req, res) {
  res.render('register');
});

router.post('/register', function (req, res, next) {
  if (!req.body) return res.sendStatus(400);
  const { username, password } = req.body;
  if (!username || !password) {
    req.session.error = 'Username and password are required.';
    return res.redirect('/auth/register');
  }
  if (db.findUser(username)) {
    req.session.error = 'Username already taken.';
    return res.redirect('/auth/register');
  }
  hash({ password }, function (err, pass, salt, h) {
    if (err) return next(err);
    db.createUser(username, salt, h);
    req.session.success = 'Account created! Please log in.';
    res.redirect('/auth/login');
  });
});

router.get('/restricted', restrict, function (req, res) {
  res.send('Wahoo! restricted area, welcome ' + req.session.user.username
    + '. Click to <a href="/auth/logout">logout</a>.');
});

router.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/auth/login');
  });
});

module.exports = router;
