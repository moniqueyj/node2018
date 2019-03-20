var winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const moment = require('moment');

function timeStampFormat(){
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ');
}

var logger = winston.createLogger({
    transports: [
        new (winstonDaily)({
            name:'info-file',
            filename:'./log/server',
            datePattern:'_yyyy-MM-dd.log',
            colorize:false,
            maxsize:50000000,
            maxFiles: 1000,
            showLevel:true,
            json:false,
            taimestamp:timeStampFormat
        }),
        new (winston.transports.Console)({
            name:'debug-console',
            colorize: true,
            level:'debug',
            showLevel:true,
            json:false,
            timestamp:timeStampFormat
        })
    ]
});
logger.debug('debugging message');
logger.debug('error message');