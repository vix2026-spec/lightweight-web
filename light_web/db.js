'use strict';

const Database = require('better-sqlite3');
const path = require('node:path');

const db = new Database(path.join(__dirname, 'users.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL
  )
`);

module.exports = {
  findUser(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },
  createUser(username, salt, hash) {
    return db.prepare('INSERT INTO users (username, salt, hash) VALUES (?, ?, ?)').run(username, salt, hash);
  }
};
