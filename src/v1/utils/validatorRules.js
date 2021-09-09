const { check } = require('express-validator');

module.exports = {
    item: () => {
        return [
            check('code').not().isEmpty().isString(),
            check('name').not().isEmpty().isString().isLength({max:50}),
            check('brand').not().isEmpty().isString().isLength({max:20}),
            check('model').not().isEmpty().isString().isLength({max:30}),
            check('category').not().isEmpty().isString().isLength({max:30}),
            check('description').isString().isLength({max:500}),
            check('returnable').not().isEmpty().isBoolean().withMessage('Data expected boolean'),
            check('unit').not().isEmpty().isString().isLength({max:10}),
        ]
    }
}