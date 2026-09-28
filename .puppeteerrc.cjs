const path = require("node:path");

// Keep Chrome inside the project so Render carries it from build to runtime.
module.exports = {
  cacheDirectory: path.join(__dirname, ".cache", "puppeteer"),
};