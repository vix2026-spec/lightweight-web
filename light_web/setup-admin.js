'use strict';

const hash = require('pbkdf2-password')();
const db = require('./db');

const [,, username, password] = process.argv;
if (!username || !password) {
  console.error('Usage: node setup-admin.js <username> <password>');
  process.exit(1);
}

const existing = db.findUser(username);
if (existing) {
  db.updateUserRole(existing.id, 'admin');
  db.updateUserStatus(existing.id, 'approved');
  console.log(`Updated "${username}" to admin role.`);
  process.exit(0);
}

hash({ password }, function (err, pass, salt, h) {
  if (err) throw err;
  db.createUser(username, salt, h, 'admin', 'approved');
  console.log(`Admin account "${username}" created successfully.`);
  process.exit(0);
});
