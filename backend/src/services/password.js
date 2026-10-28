const bcrypt = require('bcryptjs');

function createPasswordHasher({ rounds = 12 } = {}) {
  return {
    hash(password) {
      return bcrypt.hash(password, rounds);
    },
    compare(password, hash) {
      return bcrypt.compare(password, hash);
    },
  };
}

module.exports = { createPasswordHasher };
