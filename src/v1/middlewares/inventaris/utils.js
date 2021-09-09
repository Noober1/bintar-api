const express = require('express')
const db = require('../../../../lib/db')
const { getDataFromDb, randomString } = require('../../utils')
const cache = require('../../../../lib/cache')

const router = express.Router()

const generatingNumber = async() => {
    // vars
    const date = new Date()
    const getCurrentYear = date.getFullYear()
    const find = ['[CODE]','[YEAR]']
    const replace = [randomString(5).toUpperCase(),getCurrentYear]
    
    // get pattern configuration from database
    const { inventaris_nomor_regex } = await getDataFromDb()

    // generating item number
    const generatedNumber = inventaris_nomor_regex.stringReplace(find,replace)
    const getItemFromDb = await db('inventaris_barang')
        .select('nomor')
        .where('nomor',generatedNumber)

    if (getItemFromDb.length > 0) {
        generatingNumber()
    } else {
        return generatedNumber
    }
}

router.get('/generate-item-number', async(req,res,next) => {
    const { inventaris_nomor_regex } = await getDataFromDb()

    try {
        const generatedNumber = await generatingNumber()
            
        return res.json({
            pattern: inventaris_nomor_regex,
            generated:generatedNumber
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router