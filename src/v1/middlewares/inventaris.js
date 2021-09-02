const httpStatus = require('http-status');
const _ = require('lodash');
const db = require('../../../lib/db');
const pagination = require('../../../lib/pagination');
const Crypto = require('crypto');
const { json } = require('body-parser');
const dataMapping = require('../dataMapping');

// basic data inventaris

const inventarisIndex = async(req,res,next) => {

    try {
        const getItem = await db('inventaris_barang').count('id as cid').first()
        const getCategory = await db('inventaris_kategori').count('id as cid').first()
        const getInput = await db('inventaris_input').count('id as cid').first()
        const getOutput = await db('inventaris_output').count('id as cid').first()
        const getReturn = await db('inventaris_return').count('id as cid').first()

        return res.json({
            status:'active',
            maintenanceMode:false,
            counter:{
                item:getItem.cid,
                category:getCategory.cid,
                input:getInput.cid,
                return:getReturn.cid,
                output:getOutput.cid,
                audit:114,
                logs:116
            }
        })
    } catch (error) {
        next(error)
    }
}

//autentikasi untuk aplikasi inventaris
const loginAuth = async(req,res,next) => {
    try {
        let {email,password} = req.body

        if (!email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message:'Bad Request, email and/or password wasn\'t received'
            })
        }

        const encPass = Crypto.createHash('sha1').update(password).digest('hex')
        const getData = await db('dbusers')
            .select('id','nama_depan','nama_belakang','email','level')
            .where({
                email,
                password:encPass
            })
            .first()

        if (!getData) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message:'Email or password wrong'
            })
        }

        return res.json({
            firstName:getData.nama_depan,
            lastName:getData.nama_belakang,
            email:getData.email,
            level:getData.level,
        })

    } catch (error) {
        next(error)
    }
}

//cari inventaris barang
const getAllBarang = async(req,res,next) => {
    try {
        const getData = await db('inventaris_barang')
            .paginate(pagination(req.page,req.limit));

        getData.data = getData.data.map(dataMapping.item)

        return res.json(getData)

    } catch (error) {
        next(error)
    }
}

//cari inventaris barang berdasarkan id
const getBarangById = async(req,res,next) => {
    try {

        const id =_.toNumber(req.params.id)

        if (_.isNaN(id)) {
            throw new Error('Parameter invalid')
        }

        const getData = await db('inventaris_barang')
            .where('id',id)
            .first()

        if (!getData) {
            return res.status(httpStatus.NOT_FOUND).json({
                message:'Not Found'
            })
        }

        return res.json({
            data: dataMapping.item(getData)
        })

    } catch (error) {
        next(error)
    }
}

// cari daftar input berdasarkan id barang
const getInputByIdBarang = async(req,res,next) => {
    try {
        // deklarasi variabel
        let sendResponse = {};
        const { id } = req.params

        // cari item
        const getItem = await db('inventaris_barang')
            .where({
                id:id
            })
            .first()

        // jika item tidak didapatkan, kirim response not found
        if (!getItem) return res.status(httpStatus.NOT_FOUND).json({
            message:'Item not found'
        })

        // insert item data to response variable
        sendResponse = {
            ...sendResponse,
            itemDetail:getItem
        }

        // cari input data berdasarkan id barang
        const getData = await db('inventaris_input')
            .where({
                nomor:getItem.nomor
            })
            .paginate(pagination(req.page,req.limit));

        // mapping struktur data input
        getData.data = getData.data.map(dataMapping.input)

        // remove code key from list of input
        getData.data = getData.data.map(item => {
            delete item['code']
            return item
        })
        
        // combine input data to response variable
        sendResponse = {
            ...sendResponse,
            ...getData
        }

        // return response
        return res.json(sendResponse)
    } catch (error) {
        next(error)
    }
}

// cari daftar output berdasarkan id barang
const getOutputByIdBarang = async(req,res,next) => {
    try {
        let response = {}
        const { id } = req.params

        const getItem = await db('inventaris_barang')
            .where({
                id:id
            })
            .first()

        if (!getItem) return res.status(httpStatus.NOT_FOUND).json({
            message:'Item not found'
        })

        response = {
            ...response,
            itemDetail:getItem
        }

        const getData = await db('inventaris_output')
            .where({
                nomor:getItem.nomor
            })
            .paginate(pagination(req.page,req.limit));

        getData.data = getData.data.map(dataMapping.output)

        getData.data = getData.data.map(item => {
            delete item['code']
            return item
        })

        response = {
            ...response,
            ...getData
        }

        return res.json(response)
    } catch (error) {
        next(error)
    }
}

// cari semua kategori
const getCategory = async(req,res,next) => {
    try {
        const getData = await db('inventaris_kategori')
        return res.json(getData.map(dataMapping.category))
    } catch (error) {
        next(error)
    }
}

// cari kategori berdasarkan id kategori
const getCategoryById = async(req,res,next) => {
    try {
        const { id } = req.params
        const getData = await db('inventaris_kategori')
            .where({
                id:id
            })
            .first()

        if (!getData) return json.status(httpStatus.NOT_FOUND).json({
            message:'Data not found'
        })
        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

//cari data barang input
const getInput = async(req,res,next) => {
    try {
        const getData = await db('inventaris_input')
            .paginate(pagination(req.page,req.limit));

        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

//cari inventaris barang berdasarkan id
const getInputById = async(req,res,next) => {
    try {
        if (typeof req.params.id === 'undefined') {
            throw new Error('Parameter invalid')
        }

        const getData = await db('inventaris_input')
            .where('id',req.params.id)
            .first()

        if (!getData) {
            return res.status(httpStatus.NOT_FOUND).json({
                message:'Not Found'
            })
        }

        return res.json(getData)

    } catch (error) {
        next(error)
    }
}

//cari data barang input
const getOutput = async(req,res,next) => {
    try {
        const getData = await db('inventaris_output')
            .paginate(pagination(req.page,req.limit));

        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

//cari inventaris barang berdasarkan id
const getOutputById = async(req,res,next) => {
    try {
        if (typeof req.params.id === 'undefined') {
            throw new Error('Parameter invalid')
        }

        const getData = await db('inventaris_input')
            .where('id',req.params.id)
            .first()

        if (!getData) {
            return res.status(httpStatus.NOT_FOUND).json({
                message:'Not Found'
            })
        }

        return res.json(getData)

    } catch (error) {
        next(error)
    }
}

module.exports = {
    inventarisIndex,
    getAllBarang,
    getBarangById,
    loginAuth,
    getCategory,
    getCategoryById,
    getInput,
    getInputById,
    getInputByIdBarang,
    getOutputByIdBarang,
    getOutput,
    getOutputById
}