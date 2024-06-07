const errorDictionary = require('../utils/errorDictionary')

class CustomError extends Error {
    constructor({ code, message }, statusCode = 500) {
        super(message)
        this.code = code
        this.statusCode = statusCode
    }
}

function errorHandler(err, req, res, next) {
    console.error(err.stack)

    if (err instanceof CustomError) {
        res.status(err.statusCode).json({
            code: err.code,
            message: err.message
        })
    } else {
        res.status(500).json({
            code: errorDictionary.INTERNAL_SERVER_ERROR.code,
            message: err.message || errorDictionary.INTERNAL_SERVER_ERROR.message,
            stack: process.env.NODE_ENV === 'production' ? '' : err.stack
        })
    }
}

module.exports = {
    CustomError,
    errorHandler
}
