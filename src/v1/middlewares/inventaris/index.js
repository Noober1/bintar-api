const httpStatus = require('http-status');
const _ = require('lodash');
const db = require('../../../../lib/db');
const pagination = require('../../../../lib/pagination');
const Crypto = require('crypto');
const dataMapping = require('../../dataMapping');
const getDataFromDb = require('../../utils/getDataFromDb');
const { sendError } = require('../../utils');

// basic data inventaris
const inventarisIndex = async(req,res,next) => {

    try {
        const { inventaris_status, inventaris_nomor_regex } = await getDataFromDb()
        const getItem = await db('inventaris_barang').count('id as cid').first()
        const getCategory = await db('inventaris_kategori').count('id as cid').first()
        const getInput = await db('inventaris_input').count('id as cid').first()
        const getOutput = await db('inventaris_output').count('id as cid').first()
        const getReturn = await db('inventaris_return').count('id as cid').first()
        const getAudit = await db('inventaris_pemeriksaan').count('id as cid').first()

        return res.json({
            isActive:(inventaris_status === 'aktif'),
            maintenanceMode:false,
            itemNumberPatter:inventaris_nomor_regex,
            counter:{
                item:getItem.cid,
                category:getCategory.cid,
                input:getInput.cid,
                return:getReturn.cid,
                output:getOutput.cid,
                audit:getAudit.cid,
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

        const getInput = await db('inventaris_input')
            .count('id as count')
            .where('nomor', getData.nomor)
            .first()
        
        const getOutput = await db('inventaris_output')
            .count('id as count')
            .where('nomor', getData.nomor)
            .first()

        return res.json({
            data: dataMapping.item(getData),
            count: {
                input: getInput.count,
                output: getOutput.count
            },
            availableOutput:666,
            availableAudit:666,
        })

    } catch (error) {
        next(error)
    }
}

const putBarangById = async(req,res,next) => {
    const { category, ...data } = req.body

    try {
        const getBarangById = await db('inventaris_barang').select('id').where('id',req.params.id)
        const getCategories = await db('inventaris_kategori').select('nama').where('nama', category)

        // if barang data count under 1, that mean no data
        if (getBarangById.length < 1) {
            throw new sendError({
                status:400,
                code:'ID_NOT_FOUND',
                message: 'ID not found'
            })
        }

        // if category data count under 1, that mean no data
        if (getCategories.length < 1) {
            throw new sendError({
                status:400,
                code:'CATEGORY_NOT_FOUND',
                message: 'Category not found'
            })
        }

        const savingToDb = await db('inventaris_barang')
            .where('id',req.params.id)
            .update({
                nama:data.name,
                merk:data.brand,
                model:data.model,
                kategori:category,
                satuan:data.unit,
                returnable: data.returnable ? 'Y':'N',
                deskripsi:data.description || ''
            })

        if (!savingToDb) {
            throw new sendError({
                status:400,
                code:'ERR_UPDATE_DATA',
                message:'Error updating data'
            })
        }

        return res.json({
            message:'Data saved'
        })

    } catch (error) {
        next(error)
    }
}

// insert barang
const postBarang = async(req,res,next) => {
    const { code, category, ...data } = req.body

    try {
        const getItemByCode = await db('inventaris_barang').select('nomor')
            .where('nomor', code)
        
        if (getItemByCode.length > 0) {
            throw new sendError({
                status:400,
                code:'DATA_DUPLICATED',
                message:'Data with same item code already exist'
            })
        }

        const getCategories = await db('inventaris_kategori').select('nama').where('nama', category)

        // jika gagal mengambil data dari database
        if (!getCategories) {
            throw new sendError({
                code:'ERR_GET_DATA_FROM_DATABASE',
                message: 'Failed to get category data from database'
            })
        }

        if (getCategories.length < 1) {
            throw new sendError({
                status:400,
                code:'CATEGORY_DOESNT_EXIST',
                message: 'Category doesn\'t exist'
            })
        }

        const insertToDatabase = await db('inventaris_barang').insert({
            nomor:code,
            nama:data.name,
            merk:data.brand,
            model:data.model,
            kategori:category,
            satuan:data.unit,
            deskripsi:data.description || '',
            returnable: data.returnable ? 'Y':'N',
            tanggal_dibuat: new Date()
        })

        if (!insertToDatabase) {
            throw new sendError({
                code:'ERR_INSERT_DATA',
                message:'Failed insert data to database'
            })
        }

        return res.json({
            message:'Data saved'
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

const postInputByIdBarang = async(req,res,next) => {
    return res.send('ehe')
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

const getAuditByIdBarang = async(req,res,next) => {
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

        const getData = await db('inventaris_pemeriksaan')
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

// cari semua divisi
const getDivision = async(req,res,next) => {
    try {
        const getData = await db('inventaris_divisi')
        return res.json(getData.map(dataMapping.division))
    } catch (error) {
        next(error)
    }
}

// cari semua gudang penyimpanan
const getWarehouse = async(req,res,next) => {
    try {
        const getData = await db('inventaris_gudang')
        return res.json(getData.map(dataMapping.warehouse))
    } catch (error) {
        next(error)
    }
}

// cari divisi berdasarkan id divisi
const getDivisionById = async(req,res,next) => {
    try {
        const { id } = req.params
        const getData = await db('inventaris_divisi')
            .where({
                id:id
            })
            .first()

        if (!getData) return json.status(httpStatus.NOT_FOUND).json({
            message:'Data not found'
        })
        return res.json(dataMapping.division(getData))
    } catch (error) {
        next(error)
    }
}

// cari gudang penyimpanan berdasarkan id gudang penyimpanan
const getWarehouseById = async(req,res,next) => {
    try {
        const { id } = req.params
        const getData = await db('inventaris_gudang')
            .where({
                id:id
            })
            .first()

        if (!getData) return json.status(httpStatus.NOT_FOUND).json({
            message:'Data not found'
        })
        return res.json(dataMapping.warehouse(getData))
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

        if (!getData) return res.status(httpStatus.NOT_FOUND).json({
            message:'Not Found'
        })

        const getItem = await db('inventaris_barang')
            .where('nomor', getData.nomor)
            .first()

        if (!getItem) return res.status(httpStatus.NOT_FOUND).json({
            message:'Item Not Found'
        })

        return res.json({
            itemData: dataMapping.item(getItem),
            data:dataMapping.input(getData)
        })

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
    putBarangById,
    loginAuth,
    getCategory,
    getCategoryById,
    getInput,
    getInputById,
    getInputByIdBarang,
    postInputByIdBarang,
    getOutputByIdBarang,
    getOutput,
    getOutputById,
    getDivision,
    getWarehouse,
    getWarehouseById,
    getDivisionById,
    getAuditByIdBarang,
    postBarang
}