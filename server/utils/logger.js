const Log = require('../models/Log');

const log = async (level, message, meta) => {
  try {
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
  error: (message, meta) => log('error', message, meta)
};
