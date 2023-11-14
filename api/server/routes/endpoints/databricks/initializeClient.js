const { DatabricksClient } = require('../../../../app');
const { getUserKey, checkUserKeyExpiry } = require('../../../services/UserService');

const initializeClient = async ({ req, res }) => {
  let databricksApiKey = req.cookies.ws_access_token
  const client = new DatabricksClient(databricksApiKey, { req, res });
  return {
    client,
    databricksApiKey,
  };
};

module.exports = initializeClient;
