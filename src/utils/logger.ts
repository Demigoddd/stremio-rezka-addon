import winston from 'winston';

export default winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({format: 'YYYY-MM-DDTHH:mm:ss.SSSZ'}),
    winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message} ${info.stack || ''}`)
  ),
  levels: winston.config.syslog.levels,
  level: 'info',
  transports: [
    new winston.transports.Console({handleExceptions: true, stderrLevels: ['error']}),
  ],
  exitOnError: false,
});
