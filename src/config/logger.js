const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf, colorize } = format

const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`
})

const logger = createLogger({
    level: 'debug',
    format: combine(
        timestamp(),
        customFormat
    ),
    transports: [
        new transports.Console({
            format: combine(
                colorize(),
                timestamp(),
                customFormat
            ),
            level: 'debug'
        }),
        new transports.File({ filename: 'errors.log', level: 'error' })
    ]
})

if (process.env.NODE_ENV === 'production') {
    logger.level = 'info'
}

module.exports = logger