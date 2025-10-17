const Log = require('../models/Log');

// Simple timestamp formatter
const getTimestamp = () => {
  return new Date().toISOString();
};

// Simple console output formatter
const formatMessage = (level, message) => {
  return `[${getTimestamp()}] [${level.toUpperCase()}] ${message}`;
};

const log = async (level, message, meta) => {
  try {
    // Always log to console with timestamp
    const formattedMessage = formatMessage(level, message);
    
    if (level === 'error') {
      console.error(formattedMessage, meta || '');
    } else if (level === 'warn') {
      console.warn(formattedMessage, meta || '');
    } else {
      console.log(formattedMessage, meta || '');
    }

    // Save to database
    const logEntry = new Log({
      level,
      message,
      meta
    });
    await logEntry.save();
  } catch (error) {
    console.error('Failed to save log to database:', error);
  }
};

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta, errorObj) => {
    // Add error stack trace if error object is provided
    if (errorObj && errorObj.stack) {
      meta = meta || {};
      meta.stack = errorObj.stack;
    }
    return log('error', message, meta);
  },
  
  // Simple debug method
  debug: (message, meta) => {
    if (process.env.NODE_ENV === 'development') {
      log('info', `[DEBUG] ${message}`, meta);
    }
  }
};