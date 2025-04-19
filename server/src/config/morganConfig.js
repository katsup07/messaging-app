const morgan = require('morgan');

// Custom Morgan tokens
morgan.token('user-agent-parsed', (req) => {
    const ua = req.headers['user-agent'];
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
});

morgan.token('local-datetime', () => {
    return new Date().toLocaleString();
});

// Morgan format string
const morganFormat = ':local-datetime | :method :url | :status | :response-time ms | :user-agent-parsed';

module.exports = {
    morgan,
    morganFormat
};