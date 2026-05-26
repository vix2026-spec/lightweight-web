'use strict';

const Database = require('better-sqlite3');
const path = require('node:path');

const db = new Database(path.join(__dirname, 'users.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL,
    target_username TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: add columns if upgrading from old schema
const cols = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);
if (!cols.includes('role'))
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
if (!cols.includes('status'))
  db.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'");
if (!cols.includes('created_at'))
  db.exec('ALTER TABLE users ADD COLUMN created_at DATETIME');

module.exports = {
  findUser(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },
  getUserById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },
  getAllUsers({ status, search } = {}) {
    if (status && search) {
      return db.prepare('SELECT id, username, role, status, created_at FROM users WHERE status = ? AND username LIKE ? ORDER BY created_at DESC').all(status, '%' + search + '%');
    } else if (status) {
      return db.prepare('SELECT id, username, role, status, created_at FROM users WHERE status = ? ORDER BY created_at DESC').all(status);
    } else if (search) {
      return db.prepare('SELECT id, username, role, status, created_at FROM users WHERE username LIKE ? ORDER BY created_at DESC').all('%' + search + '%');
    }
    return db.prepare('SELECT id, username, role, status, created_at FROM users ORDER BY created_at DESC').all();
  },
  createUser(username, salt, hash, role = 'user', status = 'pending') {
    return db.prepare('INSERT INTO users (username, salt, hash, role, status) VALUES (?, ?, ?, ?, ?)').run(username, salt, hash, role, status);
  },
  updateUserStatus(id, status) {
    return db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
  },
  updateUserRole(id, role) {
    return db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  },
  deleteUser(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  },
  createAuditLog(adminUsername, action, targetUsername) {
    return db.prepare('INSERT INTO audit_logs (admin_username, action, target_username) VALUES (?, ?, ?)').run(adminUsername, action, targetUsername);
  },
  getAuditLogs() {
    return db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200').all();
  }
};
