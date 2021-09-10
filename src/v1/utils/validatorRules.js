const { check,body } = require('express-validator');

const msg = {
    isNotEmpty:'Data can\'t be empty',
    isString: 'Data expected string',
    isNumeric: 'Data expected numeric',
    isBoolean: 'Data expected boolean',
    isLength: (min = 1,max = 1) => `Data length invalid: min length ${min} character(s), max length ${max} character(s) required`,
    isIn: list => {
        try {
            return list.reduce((prevValue,currentValue,currentIndex) => {
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
                .isLength({max:50}).withMessage(msg.isLength(1,50)),
            body('name')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:30}).withMessage(msg.isLength(1,30)),
            body('brand')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:20}).withMessage(msg.isLength(1,20)),
            body('model')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:30}).withMessage(msg.isLength(1,30)),
            body('category')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:30}).withMessage(msg.isLength(1,30)),
            body('description')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({max:500}).withMessage(msg.isLength(0,500)),
            body('returnable')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isBoolean().withMessage(msg.isBoolean),
            body('unit')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:10}).withMessage(msg.isLength(0,10)),
        ]
    },
    input: () => {
        return [
            body('quantity')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isNumeric().withMessage(msg.isNumeric)
                .isLength({max:5}).withMessage(msg.isLength(1,5)),
            body('user')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:50}).withMessage(msg.isLength(1,50)),
            body('description')
                    .optional()
                    .isString().withMessage(msg.isString)
                    .isLength({max:500}).withMessage(msg.isLength(0,500)),
            body('storedAt')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:30}).withMessage(msg.isLength(1,30))
        ]
    }
}
