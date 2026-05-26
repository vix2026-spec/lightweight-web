'use strict';

const express = require('express');
const hash = require('pbkdf2-password')();
const rateLimit = require('express-rate-limit');
const db = require('./db');
const { generateCsrfToken, verifyCsrf } = require('./middleware');

const router = express.Router();

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

router.use(function (req, res, next) {
  const err = req.session.error;
  const msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.messageType = err ? 'error' : msg ? 'success' : '';
  res.locals.messageText = err || msg || '';
  next();
});

router.use(verifyCsrf);

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
  if (user.status === 'pending') return fn(null, null, 'Your account is pending approval by an administrator.');
  if (user.status === 'suspended') return fn(null, null, 'Your account has been suspended.');
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
  authenticate(req.body.username, req.body.password, function (err, user, reason) {
    if (err) return next(err);
    if (user) {
      req.session.regenerate(function () {
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.redirect(user.role === 'admin' ? '/admin/users' : '/auth/restricted');
      });
    } else {
      req.session.error = reason || 'Authentication failed, please check your username and password.';
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
    req.session.success = 'Account created! Your account is pending approval. Please wait for an administrator to review it.';
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
