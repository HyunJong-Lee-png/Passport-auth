const db = require('./db');

db.run('DELETE FROM users', function (err) {
  if (err) {
    return console.error(err.message);
  }
  console.log(`All users deleted. Rows affected: ${this.changes}`);
  db.close();
});