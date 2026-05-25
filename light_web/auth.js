'use strict';

const express = require('express');
const crypto = require('node:crypto');
const hash = require('pbkdf2-password')();
const rateLimit = require('express-rate-limit');
const db = require('./db');

const router = express.Router();

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

// Flash message middleware
router.use(function (req, res, next) {
  const err = req.session.error;
  const msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.messageType = err ? 'error' : msg ? 'success' : '';
  res.locals.messageText = err || msg || '';
  next();
});

// CSRF verification for POST requests
router.use(function (req, res, next) {
  if (req.method !== 'POST') return next();
  const token = req.body._csrf;
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).send('Invalid CSRF token');
  }
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many attempts, please try again later.'
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

function validateInput(username, password) {
  if (!username || username.length < 1) return 'Username is required.';
  if (username.length > 50) return 'Username must be 50 characters or less.';
  if (!password || password.length < 6) return 'Password must be at least 6 characters.';
  if (password.length > 200) return 'Password must be 200 characters or less.';
  return null;
}

router.get('/', function (req, res) {
  res.redirect('/auth/login');
});

router.get('/login', function (req, res) {
  res.render('login', { csrfToken: generateCsrfToken(req) });
});

router.post('/login', authLimiter, function (req, res, next) {
  if (!req.body) return res.sendStatus(400);
  authenticate(req.body.username, req.body.password, function (err, user) {
    if (err) return next(err);
    if (user) {
      req.session.regenerate(function () {
        req.session.user = { id: user.id, username: user.username };
        res.redirect('/auth/restricted');
      });
    } else {
      req.session.error = 'Authentication failed, please check your username and password.';
      res.redirect('/auth/login');
    }
  });
});

router.get('/register', function (req, res) {
  res.render('register', { csrfToken: generateCsrfToken(req) });
});

router.post('/register', authLimiter, function (req, res, next) {
  if (!req.body) return res.sendStatus(400);
  const { username, password } = req.body;
  const validationError = validateInput(username, password);
  if (validationError) {
    req.session.error = validationError;
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
  res.render('restricted', { username: escapeHtml(req.session.user.username) });
});

router.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/auth/login');
  });
});

module.exports = router;
