'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const { generateCsrfToken, verifyCsrf } = require('./middleware');

const router = express.Router();

router.use(function (req, res, next) {
  const err = req.session.error;
  const msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.messageType = err ? 'error' : msg ? 'success' : '';
  res.locals.messageText = err || msg || '';
  next();
});

router.use(function (req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  if (req.session.user.role !== 'admin') return res.status(403).send('Forbidden');
  next();
});

router.use(verifyCsrf);

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

router.get('/', function (req, res) {
  res.redirect('/admin/users');
});

router.get('/users', function (req, res) {
  const { status, q } = req.query;
  const users = db.getAllUsers({ status: status || null, search: q || null });
  res.render('admin/users', {
    users,
    filterStatus: status || '',
    search: q || '',
    currentUser: req.session.user,
    csrfToken: generateCsrfToken(req)
  });
});

router.post('/users/:id/approve', function (req, res) {
  const user = db.getUserById(parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  db.updateUserStatus(user.id, 'approved');
  db.createAuditLog(req.session.user.username, 'approve', user.username);
  req.session.success = `User "${user.username}" has been approved.`;
  res.redirect('/admin/users');
});

router.post('/users/:id/suspend', function (req, res) {
  const user = db.getUserById(parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  if (user.id === req.session.user.id) {
    req.session.error = 'You cannot suspend your own account.';
    return res.redirect('/admin/users');
  }
  db.updateUserStatus(user.id, 'suspended');
  db.createAuditLog(req.session.user.username, 'suspend', user.username);
  req.session.success = `User "${user.username}" has been suspended.`;
  res.redirect('/admin/users');
});

router.post('/users/:id/restore', function (req, res) {
  const user = db.getUserById(parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  db.updateUserStatus(user.id, 'approved');
  db.createAuditLog(req.session.user.username, 'restore', user.username);
  req.session.success = `User "${user.username}" has been restored.`;
  res.redirect('/admin/users');
});

router.post('/users/:id/delete', function (req, res) {
  const user = db.getUserById(parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  if (user.id === req.session.user.id) {
    req.session.error = 'You cannot delete your own account.';
    return res.redirect('/admin/users');
  }
  db.deleteUser(user.id);
  db.createAuditLog(req.session.user.username, 'delete', user.username);
  req.session.success = `User "${user.username}" has been deleted.`;
  res.redirect('/admin/users');
});

router.get('/audit', function (req, res) {
  const logs = db.getAuditLogs();
  res.render('admin/audit', {
    logs,
    currentUser: req.session.user,
    csrfToken: generateCsrfToken(req)
  });
});

module.exports = router;
