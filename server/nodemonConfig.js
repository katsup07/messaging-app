const fs = require('fs');

// Default config without polling
const baseConfig = {
  watch: ["src/"],
  ext: "js,json",
  ignore: ["node_modules/", "logs/"]
};

// Docker-specific config with polling, needed for Docker on Windows for live updates
const dockerConfig = {
  ...baseConfig,
  polling: true,
  legacyWatch: true,
  delay: 1000
};

const config = process.env.DOCKER_ENVIRONMENT === 'true' ? dockerConfig : baseConfig;

fs.writeFileSync('nodemon.json', JSON.stringify(config, null, 2));

console.log(`Nodemon configured for ${process.env.DOCKER_ENVIRONMENT === 'true' ? 'Docker' : 'local'} environment`);