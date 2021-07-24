const config = require("../../config"), OAuth2Client = require("discord-oauth2");

module.exports = new OAuth2Client({
  clientId: config.client.id,
  clientSecret: config.client.secret
});