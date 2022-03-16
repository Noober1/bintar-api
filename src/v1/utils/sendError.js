function sendError({status = 500, code = 'UNKNOWN', message = 'No Message', data }) {
    const error = new Error(message);
    error.code = code
    error.status = status
    error.data = data || undefined
    return error
}

sendError.prototype = Object.create(Error.prototype);

module.exports = sendError