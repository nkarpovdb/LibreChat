const passport = require('passport');

const requireJwtAuth = passport.authenticate('jwt-databricks', { session: false });

module.exports = requireJwtAuth;
