const { info } = require('console');
const fs = require('fs');
const path = require('path');

function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logRequest(req.method, req.originalUrl, res.statusCode, duration);
  });
  next();
};

// General application logging functions
function logInfo(message) {
  // Console output for development
  console.log(`${colors.brightBlue}[INFO]${colors.reset} ${colors.blue}${_getJSTTimestamp()}${colors.reset} ${message}`);
}

function logError(message, error) {
  const timestamp = _getJSTTimestamp();
  
  const errorLog = `[ERROR] ${timestamp} ${message} ${error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : ''}\n`;
  errorLogStream.write(errorLog);
  
  // Console output for development
  console.error(`${colors.brightRed}[ERROR]${colors.reset} ${colors.red}${timestamp}${colors.reset} ${message}`, error ? error : '');
}

function logRequest(method, url, statusCode, duration) {
  // Choose color based on status code
  let statusColor = colors.green;
  if (statusCode >= 400 && statusCode < 500) {
    statusColor = colors.yellow;
  } else if (statusCode >= 500) {
    statusColor = colors.red;
  }

  // Choose color based on method
  let methodColor;
  switch (method) {
    case 'GET':
      methodColor = colors.cyan;
      break;
    case 'POST':
      methodColor = colors.green;
      break;
    case 'PUT':
    case 'PATCH':
      methodColor = colors.yellow;
      break;
    case 'DELETE':
      methodColor = colors.red;
      break;
    default:
      methodColor = colors.blue;
  }

  console.log(
    `${colors.brightCyan}[REQUEST]${colors.reset} ` +
    `${colors.blue}${_getJSTTimestamp()}${colors.reset} ` +
    `${methodColor}${method}${colors.reset} ${url} ` +
    `${statusColor}${statusCode}${colors.reset} - ` +
    `${colors.yellow}${duration}ms${colors.reset}`
  );
}

function _getJSTTimestamp() {
  return new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-').replace(',', '');
}

// ANSI color codes for terminal output - streamlined color palette
const colors = {
  reset: '\x1b[0m',
  // Text colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  // Bright text colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightBlue: '\x1b[94m',
  brightCyan: '\x1b[96m'
};

// Persistent logging to file
const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}
// Single stream instance
const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, 'access.log'),
    { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
    path.join(logDirectory, 'error.log'),
    { flags: 'a' }
);

module.exports = { 
    logger, 
    logInfo, 
    logError, 
    accessLogStream 
};

