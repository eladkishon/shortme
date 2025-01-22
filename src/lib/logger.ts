import pino from 'pino';
import pretty from 'pino-pretty';

const stream = pretty({
  colorize: true,
  translateTime: 'SYS:standard',
  ignore: 'pid,hostname',
});

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
}, stream);

export default logger;