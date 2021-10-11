const { check,body } = require('express-validator');

const msg = {
    isNotEmpty:'Data can\'t be empty',
    isString: 'Data expected string',
    isInt: (min = 1,max = 65535) => `Data expected int between ${min} to ${max}`,
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
                .isInt({min:1}).withMessage(msg.isInt(1))
                .isLength({max:5}).withMessage(msg.isLength(1,5)),
            body('user')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:50}).withMessage(msg.isLength(1,50)),
            body('media')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:100}).withMessage(msg.isLength(1,100)),
            body('description')
                    .optional()
                    .isString().withMessage(msg.isString)
                    .isLength({max:500}).withMessage(msg.isLength(0,500)),
            body('storedAt')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:30}).withMessage(msg.isLength(1,30))
        ]
    },
    output: () => {
        return [
            body('code')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:50}).withMessage(msg.isLength(1,50)),
            body('user')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:50}).withMessage(msg.isLength(1,50)),
            body('staff')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:50}).withMessage(msg.isLength(1,50)),
            body('description')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({max:500}).withMessage(msg.isLength(0,500)),
        ]
    },
    return: () => {
        return [
            body('code')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:50}).withMessage(msg.isLength(1,50)),
            body('outputCode')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:30}).withMessage(msg.isLength(1,30)),
            body('user')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:50}).withMessage(msg.isLength(1,50)),
            body('staff')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isString().withMessage(msg.isString)
                .isLength({max:50}).withMessage(msg.isLength(1,50)),
            body('description')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({max:500}).withMessage(msg.isLength(0,500)),
            body('itemGood')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt({min:0}).withMessage(msg.isInt(0))
                .isLength({max:5}).withMessage(msg.isLength(1,5)),
            body('itemLightBroken')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt({min:0}).withMessage(msg.isInt(0))
                .isLength({max:5}).withMessage(msg.isLength(1,5)),
            body('itemHeavyBroken')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt({min:0}).withMessage(msg.isInt(0))
                .isLength({max:5}).withMessage(msg.isLength(1,5)),
            body('itemLost')
                .not().isEmpty().withMessage(msg.isNotEmpty)
                .isInt({min:0}).withMessage(msg.isInt(0))
                .isLength({max:5}).withMessage(msg.isLength(1,5))
        ]
    },
    media: () => {
        return [
            body('title')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({max:100}).withMessage(msg.isLength(0,100)),
            body('description')
                .optional()
                .isString().withMessage(msg.isString)
                .isLength({max:500}).withMessage(msg.isLength(0,500)),
        ]
    }
}
