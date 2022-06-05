const { body } = require('express-validator');

const msg = {
    isNotEmpty: 'Data can\'t be empty',
    isString: 'Data expected string',
    isDate: 'Data expected date',
    isEmail: 'Data expected email format',
    isInt: (min = 1, max = 65535) => `Data expected int between ${min} to ${max}`,
    isBoolean: 'Data expected boolean',
    isLength: (min = 1, max = 1) => `Data length invalid: min length ${min} character(s), max length ${max} character(s) required`,
    isIn: list => {
        try {
            return 'Data must be one of them: ' + list.reduce((prevValue, currentValue, currentIndex) => {
                const isLastData = ++currentIndex == list.length
                if (isLastData && list.length > 1) {
                    return prevValue + `and ${currentValue}.`
                } else if (list.length == 1) {
                    return prevValue + currentValue
                } else {
                    return prevValue + `${currentValue}, `
                }
            }, '')
        } catch (error) {
            console.log(error)
            return '(Error: No data given)'
        }
    }
}

module.exports = {
    item: () => {
        return [
            body('code')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('name')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 30 }).withMessage(msg.isLength(1, 30)),
            body('brand')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 20 }).withMessage(msg.isLength(1, 20)),
            body('model')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 30 }).withMessage(msg.isLength(1, 30)),
            body('category')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 30 }).withMessage(msg.isLength(1, 30)),
            body('description')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({ max: 500 }).withMessage(msg.isLength(0, 500)),
            body('returnable')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isBoolean().withMessage(msg.isBoolean),
            body('unit')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 10 }).withMessage(msg.isLength(0, 10)),
        ]
    },
    input: () => {
        return [
            body('quantity')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt({ min: 1 }).withMessage(msg.isInt(1))
                .isLength({ max: 5 }).withMessage(msg.isLength(1, 5)),
            body('user')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('media')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 100 }).withMessage(msg.isLength(1, 100)),
            body('description')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({ max: 500 }).withMessage(msg.isLength(0, 500)),
            body('storedAt')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 30 }).withMessage(msg.isLength(1, 30))
        ]
    },
    output: () => {
        return [
            body('code')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('user')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('staff')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('description')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({ max: 500 }).withMessage(msg.isLength(0, 500)),
        ]
    },
    return: () => {
        return [
            body('code')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('outputCode')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 30 }).withMessage(msg.isLength(1, 30)),
            body('user')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('staff')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('description')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({ max: 500 }).withMessage(msg.isLength(0, 500)),
            body('itemGood')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt({ min: 0 }).withMessage(msg.isInt(0))
                .isLength({ max: 5 }).withMessage(msg.isLength(1, 5)),
            body('itemLightBroken')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt({ min: 0 }).withMessage(msg.isInt(0))
                .isLength({ max: 5 }).withMessage(msg.isLength(1, 5)),
            body('itemHeavyBroken')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt({ min: 0 }).withMessage(msg.isInt(0))
                .isLength({ max: 5 }).withMessage(msg.isLength(1, 5)),
            body('itemLost')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt({ min: 0 }).withMessage(msg.isInt(0))
                .isLength({ max: 5 }).withMessage(msg.isLength(1, 5))
        ]
    },
    media: () => {
        return [
            body('title')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({ max: 100 }).withMessage(msg.isLength(0, 100)),
            body('description')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({ max: 500 }).withMessage(msg.isLength(0, 500)),
        ]
    },
    // for administrasi student
    student: (withpassword = true) => {
        let withPass = () => {
            return body('password')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50))
        }
        let withoutPass = () => {
            return body('password')
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50))
        }

        let passwordField = withpassword ? withPass : withoutPass
        return [
            body('NIS')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 30 }).withMessage(msg.isLength(1, 30)),
            body('firstName')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('lastName')
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('email')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            passwordField(),
            body('status')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isIn(['aktif', 'alumni', 'dropout', 'lainnya']).withMessage(msg.isIn(['aktif', 'alumni', 'dropout', 'lainnya'])),
            body('class')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt().withMessage(msg.isInt(0)),
            body('type')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isIn(['reguler', 'beasiswa']).withMessage(msg.isIn(['reguler', 'beasiswa'])),
            body('prodi')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt().withMessage(msg.isInt(0)),
        ]
    },
    class: () => {
        return [
            body('name')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('semester')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isIn([1, 2, 3, 4, 5, 6, 7, 8]).withMessage(msg.isIn([1, 2, 3, 4, 5, 6, 7, 8])),
            body('angkatan')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt().withMessage(msg.isInt(4)),
            body('isActive')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isBoolean().withMessage(msg.isBoolean),
        ]
    },
    payment: (mode = 'add') => {
        const fieldAddMode = () => {
            if (mode === 'add') {
                return [
                    body('type')
                        .not().isEmpty().withMessage(msg.isNotEmpty)
                        .isString().withMessage(msg.isString)
                        .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
                    body('price')
                        .not().isEmpty().withMessage(msg.isNotEmpty)
                        .isInt({ min: 09, max: 999999999 }).withMessage(msg.isInt(0, 999999999))
                ]
            } else {
                return []
            }
        }

        return [
            body('admin')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
            body('description')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 500 }).withMessage(msg.isLength(1, 500)),
            ...fieldAddMode()
        ]
    },
    receipt: () => {
        return [
            body('transactionDate')
                .not().isEmpty().withMessage(msg.isNotEmpty),
            body('accountNumber')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 100 }).withMessage(msg.isLength(1, 100)),
            body('sender')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 100 }).withMessage(msg.isLength(1, 100)),
            body('refNumber')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 100 }).withMessage(msg.isLength(1, 100)),
            body('picture')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 500 }).withMessage(msg.isLength(1, 500)),
            body('destinationAccount')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({ max: 15 }).withMessage(msg.isLength(1, 15)),
        ]
    },
    validatePayment: () => {
        return [
            body('paymentMethod')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isIn(['manual', 'transfer']).withMessage(msg.isIn(['manual', 'transfer'])),
            body('nominal')
                .isLength({ max: 999999999 }).withMessage(msg.isLength(1, 999999999)),
            body('payer')
                .isString().withMessage(msg.isString)
                .isLength({ max: 100 }).withMessage(msg.isLength(1, 100)),
            body('invalid')
                .isBoolean().withMessage(msg.isBoolean)
        ]
    },

    // PPDB
    PPDBRegister: () => [
        body('birthDate')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isString().withMessage(msg.isString),
        body('captchaToken')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isString().withMessage(msg.isString),
        body('birthPlace')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isString().withMessage(msg.isString)
            .isLength({ max: 15 }).withMessage(msg.isLength(1, 15)),
        body('email')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isEmail().withMessage(msg.isEmail)
            .isLength({ max: 50 }).withMessage(msg.isLength(1, 50)),
        body('firstName')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isString().withMessage(msg.isString)
            .isLength({ max: 45 }).withMessage(msg.isLength(1, 45)),
        body('lastName')
            .isString().withMessage(msg.isString)
            .isLength({ max: 45 }).withMessage(msg.isLength(1, 45)),
        body('graduateYear')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isInt().withMessage(msg.isInt)
            .isLength({ max: 4 }).withMessage(msg.isLength(1, 4)),
        body('lastEducation')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isIn(['SMP', 'MTS']).withMessage(msg.isIn(['SMP', 'MTS'])),
        body('lastEducationSchool')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isString().withMessage(msg.isString)
            .isLength({ max: 10 }).withMessage(msg.isLength(1, 10)),
        body('nisn')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isString().withMessage(msg.isString)
            .isLength({ max: 10 }).withMessage(msg.isLength(1, 10)),
        body('phone')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isString().withMessage(msg.isString)
            .isLength({ max: 15 }).withMessage(msg.isLength(1, 15)),
        body('selectedMajor')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isString().withMessage(msg.isString)
            .isLength({ max: 30 }).withMessage(msg.isLength(1, 30)),
        body('sex')
            .not().isEmpty().withMessage(msg.isNotEmpty)
            .isIn(['L', 'P']).withMessage(msg.isIn(['L', 'P']))
    ]
}
