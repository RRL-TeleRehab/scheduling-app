const { createClient } = require("redis");
const utils = require("util");
const redisClient = createClient({
  port: 6379,
  legacyMode: true,
});
redisClient.connect().then(() => {});
redisClient.set = utils.promisify(redisClient.set);

module.exports = redisClient;
