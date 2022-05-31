const Recaptcha = require('express-recaptcha').RecaptchaV3

const getRecaptcha = () => {
    return new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY, { callback: 'cb' })
}

module.exports = getRecaptcha