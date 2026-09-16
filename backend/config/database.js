const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const configuredPath = process.env.DATABASE_PATH || './database/cartify.db';
const dbPath = path.isAbsolute(configuredPath)
  ? configuredPath
  : path.join(__dirname, '..', configuredPath.replace(/^\.\//, ''));

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

console.log('SQLite database connected successfully');

module.exports = db;
