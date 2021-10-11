const httpStatus = require('http-status');
const _ = require('lodash');
const db = require('../../../../lib/db');
const pagination = require('../../../../lib/pagination');
const Crypto = require('crypto');
const dataMapping = require('./dataMapping');
const getDataFromDb = require('../../utils/getDataFromDb');
const { sendError, randomString } = require('../../utils');
const { logger } = require('../../../../lib/logger');
const transactionCalculator = require('./transactionCalculator')

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
            itemNumberPattern:inventaris_nomor_regex,
            itemNumberTemplates: [
                {name: '[CODE]', description: 'Kode barang'},
                {name: '[YEAR]', description: 'Tahun pembuatan data'}
            ],
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
            .orderBy('tanggal_dibuat','desc')
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

        const getTransactionCalculator = await transactionCalculator(getData, 'item')

        return res.json({
            data: dataMapping.item(getData),
            detail: getTransactionCalculator
        })

    } catch (error) {
        next(error)
    }
}

// update barang berdasarkan id barang
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

        const dataToUpdate = {
            nama:data.name,
            merk:data.brand,
            model:data.model,
            kategori:category,
            satuan:data.unit,
            returnable: data.returnable ? 'Y':'N',
            deskripsi:data.description || ''
        }

        const updating = await db('inventaris_barang')
            .where('id',req.params.id)
            .update(dataToUpdate)

        if (!updating) {
            throw new sendError({
                code:'ERR_UPDATE_DATA',
                message:'Error updating data'
            })
        }

        await logger('update_item','Berhasil memperbarui data barang', 'cucu.ruhiyatna3@gmail.com' ,JSON.stringify(dataToUpdate))

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

        const dataToinsert = {
            nomor:code,
            nama:data.name,
            merk:data.brand,
            model:data.model,
            kategori:category,
            satuan:data.unit,
            deskripsi:data.description || '',
            returnable: data.returnable ? 'Y':'N',
            tanggal_dibuat: new Date()
        }

        const insertToDatabase = await db('inventaris_barang').insert(dataToinsert)

        if (!insertToDatabase) {
            throw new sendError({
                code:'ERR_INSERT_DATA',
                message:'Failed insert data to database'
            })
        }

        await logger('insert_item','Berhasil membuat data barang', null, JSON.stringify(dataToinsert))

        return res.json({
            message:'Data saved'
        })
    } catch (error) {
        next(error)
    }
}

const getReturnById = async(req,res,next) => {
    try {
        const getData = await db('inventaris_return').where({
            id: req.params.id
        }).first()

        if (!getData) {
            throw new sendError({
                status:404,
                code: 'NOT_FOUND',
                message: 'Return data with id given not found'
            })
        }
        return res.json({
            data: dataMapping.return(getData),
            detail: {}
        })
    } catch (error) {
        next(error)
    }
}

const postReturn = async(req,res,next) => {
    try {
        let sumReturnQuantityFromDatabase = 0;
        const getItemCode = await db('inventaris_barang').where({
            nomor: req.body.code
        }).first()
        if (!getItemCode) {
            throw new sendError({
                status:400,
                code:'ITEM_NOT_FOUND',
                message: 'Item with code given not found'
            })
        }
        
        const getOutput = await db('inventaris_output').where({
            nomor_output: req.body.outputCode,
            nomor: getItemCode.nomor
        }).first()
        if (!getOutput) {
            throw new sendError({
                status:400,
                code:'OUTPUT_NOT_FOUND',
                message: 'Output data with id given not found'
            })
        }

        const getUser = await db('dbusers').where({
            email: req.body.user
        }).first()
        if (!getUser) {
            throw new sendError({
                status:400,
                code:'USER_NOT_FOUND',
                message: 'User with email given not found'
            })
        }

        const getStaff = await db('dbstaff').where({
            email: req.body.staff
        }).first()
        if (!getStaff) {
            throw new sendError({
                status:400,
                code:'STAFF_NOT_FOUND',
                message: 'Staff with email given not found'
            })
        }

        const getReturnByOutputId = await db('inventaris_return')
            .where({
                id_output: getOutput.id
            })
            .sum({
                itemGood: 'kondisi_bagus',
                itemLightBroken: 'kondisi_rusak_ringan',
                itemHeavyBroken: 'kondisi_rusak_berat',
                itemLost: 'kondisi_hilang'
            })
            .first()

        if (getReturnByOutputId) {
            let { itemGood, itemLightBroken, itemHeavyBroken, itemLost } = getReturnByOutputId
            sumReturnQuantityFromDatabase += itemGood + itemLightBroken + itemHeavyBroken + itemLost
        }

        const sumQuantityFromBody = parseInt(req.body.itemGood) + parseInt(req.body.itemLightBroken) + parseInt(req.body.itemHeavyBroken) + parseInt(req.body.itemLost)
        if (sumQuantityFromBody > getOutput.kuantitas) {
            console.log('triggered sumQuantityFromBody',sumQuantityFromBody, getOutput.kuantitas)
            throw new sendError({
                status:400,
                code: 'QUANTITY_DATA_OVERLOAD',
                message: 'Accumulation from item good, item light broken, item heavy broken and item lost exceeding output quantity'
            })
        } else if(sumQuantityFromBody < 1) {
            console.log('triggered sumQuantityFromBody',sumQuantityFromBody)
            throw new sendError({
                status:400,
                code: 'QUANTITY_DATA_ZERO',
                message: 'Accumulation from item good, item light broken, item heavy broken and item lost cannot be zero'
            })
        }

        if ((getOutput.kuantitas - sumReturnQuantityFromDatabase) < 1) {
            throw new sendError({
                status:400,
                code: 'RETURN_QUOTA_EXCEEDED',
                message: 'Cannot add return data because all item have returned'
            })
        }

        const inserting = await db('inventaris_return').insert({
            nomor: req.body.code,
            nomor_input: getOutput.nomor_input,
            id_output: getOutput.id,
            pengguna: req.body.user,
            staff: req.body.staff,
            kondisi_bagus: req.body.itemGood,
            kondisi_rusak_ringan: req.body.itemLightBroken,
            kondisi_rusak_berat: req.body.itemHeavyBroken,
            kondisi_hilang: req.body.itemLost,
            deskripsi: req.body.description
        })
        
        if (inserting) {
            return res.json({
                success:true,
                data: inserting
            })
        }
        // return res.json({
        //     getItemCode,getOutputByOutputCode,sumReturnQuantityFromDatabase
        // })
    } catch (error) {
        next(error)
    }
}

// cari return data berdarsarkan id output
const getReturnByOutputId = async(req,res,next) => {
    try {
        const getData = await db('inventaris_return').where({
            id_output: req.params.id
        }).paginate(pagination(req.page,req.limit))

        const getOutputData = await db('inventaris_output').where({
            id: req.params.id
        }).first()

        if (!getOutputData) {
            throw new sendError({
                error:404,
                code: 'Not Found',
                message: 'Output with id given not found'
            })
        }

        getData.outputData = dataMapping.output(getOutputData)
        getData.data = getData.data.map(dataMapping.return)
        return res.json(getData)
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
        if (!getItem) {
            throw new sendError({
                status: 400,
                message: 'Data not found',
                code: 'NOT_FOUND'
            })
        }

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
            .orderBy('tanggal','desc')
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

// insert data input berdasarkan id barang
const postInputByIdBarang = async(req,res,next) => {
    try {

        // cari data item berdasarkan param id
        const getData = await db('inventaris_barang').select('id', 'returnable', 'nomor').where('id',req.params.id).first()

        // jika data barang tidak ditemukan, throw error
        if(!getData){
            throw new sendError({
                status:400,
                code:'ITEM_NOT_FOUND',
                message:'Item not found'
            })
        }

        // cari data user di database
        const getUser = await db('dbusers').select('email').where('email', req.body.user).first()

        if(!getUser) {
            throw new sendError({
                status:400,
                code:'USER_NOT_FOUND',
                message:'User not found'
            })
        }

        // cari data gudang di database
        const getStoredAt = await db('inventaris_gudang').select('nama').where('nama', req.body.storedAt).first()

        if(!getStoredAt) {
            throw new sendError({
                status:400,
                code:'WAREHOUSE_NOT_FOUND',
                message:'Warehouse not found'
            })
        }

        // cari data gudang di database
        const getMedia = await db('media').select('nama').where('nama', req.body.media).first()

        if(!getMedia) {
            throw new sendError({
                status:400,
                code:'MEDIA_NOT_FOUND',
                message:'Media with name given not found'
            })
        }
        
        const defaultFormData = {
            nomor: getData.nomor,
            nomor_input: '',
            kuantitas: _.isNaN(req.body.quantity) ? 1 : parseInt(req.body.quantity),
            pengguna: req.body.user,
            deskripsi: req.body.description,
            tempat_disimpan: req.body.storedAt,
            media: req.body.media,
            tanggal: new Date()
        }

        if (getData.returnable === 'Y') {
            const generateFormData = async() => {
                // buat variable untuk data yang akan dikirim
                let formData = []

                // untuk menampung id input yang sudah digenerate untuk pengecekan duplikasi
                let findCode = []

                for (let index = 0; index < req.body.quantity; index++) {
                    let tempData = {}
                    let randomInputCode = randomString(5).toUpperCase()
                    tempData.kuantitas = 1
                    tempData.nomor_input = randomInputCode
                    let toPush = {
                        ...defaultFormData,
                        ...tempData
                    }
                    findCode.push(randomInputCode)
                    formData.push(toPush)
                }

                // cari data yang ada di array findCode, jika hasil tidak nihil berarti data duplikat
                const checkDuplicationInput = await db('inventaris_input').where('nomor', getData.nomor).whereIn('nomor_input', findCode).select('nomor_input')

                // jika error mencari data di DB
                if (!checkDuplicationInput) {
                    console.log('Data duplikat')
                    return false
                // jika data tidak nihil
                } else if (checkDuplicationInput.length > 1) {
                    generateFormData()
                // semua OK
                } else {
                    return { formData, codes: findCode }
                }
            }

            const { formData, codes } = await generateFormData()

            if (!formData) {
                throw new sendError({
                    status: 500,
                    code: 'ERR_GENERATE_FORMDATA',
                    message: 'Error when generating formData'
                })
            }

            const inserting = await db('inventaris_input').insert(formData)

            if (!inserting) {
                throw new sendError({
                    status: 500,
                    code: 'ERR_INSERT_DATA',
                    message: 'Error when inserting data'
                })
            }

            await logger('insert_input','Berhasil membuat data input', req.body.user || 'cucu.ruhiyatna3@gmail.com', JSON.stringify(formData))
            
            return res.json({
                message:'Data saved',
                data: {
                    code: getData.nomor,
                    inputCode: codes
                },
                responseInsert:inserting
            })
        } else {
            const generateInputCode = async() => {
                const createInputCode = randomString(5).toUpperCase()
                const checkDuplication = await db('inventaris_input').where({
                    'nomor': getData.nomor,
                    'nomor_input': createInputCode
                }).first()

                if (checkDuplication) {
                    generateInputCode()
                } else {
                    return createInputCode
                }
            }

            const inputCode = await generateInputCode()

            const formData = {
                ...defaultFormData,
                nomor_input: inputCode
            }

            const inserting = await db('inventaris_input').insert(formData)

            if (!inserting) {
                throw new sendError({
                    status: 500,
                    code: 'ERR_INSERT_DATA',
                    message: 'Error when inserting data'
                })
            }

            await logger('add_item','Berhasil membuat data input', req.body.user || 'cucu.ruhiyatna3@gmail.com', JSON.stringify(formData))

            return res.json({
                message:'Data saved',
                data: {
                    code: getData.nomor,
                    inputCode: inputCode
                },
                responseInsert:inserting
            })
        }

    } catch (error) {
        next(error)
    }
}

// update data input berdasarkan id input
const putInputById = async(req,res,next) => {
    const { quantity, storedAt, user, media, ...data } = req.body

    try {
        const getInputData = await db('inventaris_input').where('id', req.params.id).first()

        if (!getInputData) {
            throw new sendError({
                status:400,
                code: 'INPUT_NOT_FOUND',
                message: 'Input data not found'
            })
        }

        const getItemData = await db('inventaris_barang').where('nomor',getInputData.nomor).first()

        if (!getItemData) {
            throw new sendError({
                status:400,
                code: 'ITEM_NOT_FOUND',
                message: 'Item data not found'
            })
        }

        const getStoredAt = await db('inventaris_gudang').select('nama').where('nama', storedAt).first()

        if (!getStoredAt) {
            throw new sendError({
                status:400,
                code: 'WAREHOUSE_NOT_FOUND',
                message: 'Warehouse data not found'
            })
        }

        const getUser = await db('dbusers').select('id').where('email', user).first()

        if (!getUser) {
            throw new sendError({
                status:400,
                code: 'USER_NOT_FOUND',
                message: 'User data not found'
            })
        }

        if (getItemData.returnable === 'Y' && req.body.quantity != 1) {
            throw new sendError({
                status:400,
                code: 'RETURNABLE_QUANTITY_INVALID',
                message: 'Quantity data for Input data from Item data with Returnable status is \'true\' must be valued by 1'
            })
        }

        // cari data gudang di database
        const getMedia = await db('media').select('nama').where('nama', media).first()

        if(!getMedia) {
            throw new sendError({
                status:400,
                code:'MEDIA_NOT_FOUND',
                message:'Media with name given not found'
            })
        }

        const dataToUpdate = {
            kuantitas: quantity,
            tempat_disimpan: storedAt,
            pengguna: user,
            media: media,
            deskripsi: data.description
        }

        if (getItemData.returnable === 'Y') {
            dataToUpdate.kuantitas = 1
        } else {
            const getOutput = await db('inventaris_output')
                .sum({ count: 'kuantitas' })
                .where('nomor_input', getInputData.nomor_input)
                .first()

            const getAudit = await db('inventaris_pemeriksaan')
                .sum({
                    good: 'kondisi_bagus',
                    lightBroken: 'kondisi_rusak_ringan',
                    heavyBroken: 'kondisi_rusak_berat',
                    lost: 'kondisi_hilang',
                })
                .where('nomor_input', getInputData.nomor_input)
                .first()
            
            if (!getOutput || !getAudit) {
                throw new sendError({
                    status:500,
                    code: 'ERR_GET_OTHER_DATA',
                    message: 'Error when getting other required data'
                })
            }

            // count data from output and audit table
            const sumAvailableQuantity = getOutput.count + getAudit.good + getAudit.lightBroken + getAudit.heavyBroken + getAudit.lost

            if (quantity < sumAvailableQuantity) {
                throw new sendError({
                    status:400,
                    code: 'QUANTITY_UNDER_MINIMUM',
                    message: `Quantity data under minimum, ${sumAvailableQuantity} or more required`
                })
            }
        }

        const updating = await db('inventaris_input').update(dataToUpdate).where('id', req.params.id)
        
        if (updating) {
            await logger('update_input','Berhasil memperbarui data input', user, JSON.stringify(dataToUpdate))
            return res.json({
                message:'Data updated'
            })
        } else {
            await logger('update_input','gagal memperbarui data input', user, JSON.stringify(dataToUpdate))
            throw new sendError({
                message:'Error when updating data',
                code: 'ERR_UPDATING_DATA'
            })
        }
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
            .orderBy('tanggal','desc')
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

const putOutputById = async(req,res,next) => {
    try {
        
        const getOutputData = await db('inventaris_output').where('id', req.params.id).first()
        if (!getOutputData) {
            throw new sendError({
                status:404,
                code: 'OUTPUT_NOT_FOUND',
                message:'Output data with given id not found'
            })
        }

        const getInputData = await db('inventaris_input').where('nomor_input', getOutputData.nomor_input).first()
        if (!getInputData) {
            throw new sendError({
                status:400,
                code: 'INPUT_NOT_FOUND',
                message:'Input data not found'
            })
        }

        const getTransactionCalculator = await transactionCalculator(getInputData)

        if (!getTransactionCalculator) {
            throw new sendError({
                status:500,
                code:'ERR_CALCULATING_TRANSACTION',
                message: 'Error while calculating transaction data'
            })
        }

        const getUser = await db('dbusers').select('email').where('email', req.body.user).first()
        const getStaff = await db('dbusers').select('email').where('email', req.body.staff).first()

        // Jika data user tidak ditemukan
        if (!getUser) {
            throw new sendError({
                status:400,
                code: 'USER_NOT_FOUND',
                message: 'User with data given not found'
            })
        }

        if (!getStaff) {
            throw new sendError({
                status:400,
                code: 'STAFF_NOT_FOUND',
                message: 'Staff with data given not found'
            })
        }

        const { quantity } = getTransactionCalculator
        const availableEditOutput = getOutputData.quantity + quantity.availableOutput

        // jika kuantitas yang diberikan melebihi stok kuantitas yang tersedia
        if (req.body.quantity > availableEditOutput) {
            throw new sendError({
                status:400,
                code: 'QUANTITY_EXCEEDED',
                message: 'Quantity exceeds available quantity'
            })
        }
        
        const dataToUpdate = {
            kuantitas: req.body.quantity,
            staff: req.body.staff,
            pengguna: req.body.user,
            deskripsi: req.body.description
        }
        const updating = await db('inventaris_output')
            .where('id',req.params.id)
            .update(dataToUpdate)

        if (!updating) {
            throw new sendError({
                code:'ERR_UPDATE_DATA',
                message:'Error updating data'
            })
        }

        await logger('update_output','Berhasil memperbarui data output dengan nomor output ' + getOutputData.outputid, req.body.user ,JSON.stringify(dataToUpdate))

        return res.json({
            message:'Data saved'
        })

        // return res.json(getTransactionCalculator)
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
            .orderBy('tanggal','desc')
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
        const getData = await db('inventaris_kategori').paginate(pagination(req.page,req.limit))
        getData.data = getData.data.map(dataMapping.category)
        return res.json(getData)
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
        const getData = await db('inventaris_divisi').paginate(pagination(req.page,req.limit))
        getData.data = getData.data.map(dataMapping.division)
        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

// cari semua gudang penyimpanan
const getWarehouse = async(req,res,next) => {
    try {
        const getData = await db('inventaris_gudang').paginate(pagination(req.page,req.limit))
        getData.data = getData.data.map(dataMapping.warehouse)
        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

// cari semua staff
const getStaff = async(req,res,next) => {
    try {
        const getData = await db('dbstaff').paginate(pagination(req.page,req.limit))
        getData.data = getData.data.map(dataMapping.staff)
        return res.json(getData)
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
        const getData = await db('inventaris_input').orderBy('tanggal')
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

        // input data
        const getData = await db('inventaris_input')
            .where('id',req.params.id)
            .first()

        if (!getData) return res.status(httpStatus.NOT_FOUND).json({
            message:'Not Found'
        })

        // cari data barang berdasarkan nomor barang
        const getItem = await db('inventaris_barang')
            .where('nomor', getData.nomor)
            .first()

        if (!getItem) return res.status(httpStatus.NOT_FOUND).json({
            message:'Item Not Found'
        })

        const getTransactionCalculator = await transactionCalculator(getData)

        if (!getTransactionCalculator) {
            throw new sendError({
                status:500,
                code:'ERR_CALCULATING_TRANSACTION',
                message: 'Error while calculating transaction data'
            })
        }

        return res.json({
            itemData: dataMapping.item(getItem),
            data:dataMapping.input(getData),
            detail: getTransactionCalculator
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

        getData.data = getData.data.map(dataMapping.output)

        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

//cari inventaris output berdasarkan id
const getOutputById = async(req,res,next) => {
    try {
        if (typeof req.params.id === 'undefined') {
            throw new Error('Parameter invalid')
        }

        const getData = await db('inventaris_output')
            .where('id',req.params.id)
            .first()

        if (!getData) {
            throw new sendError({
                status:404,
                code:'NOT_FOUND',
                message: 'Output data with id given not found'
            })
        }

        const getItemData = await db('inventaris_barang').where({
            nomor: getData.nomor
        }).first()

        if (!getItemData) {
            throw new sendError({
                status:404,
                code:'ITEM_NOT_FOUND',
                message: 'Item data with code given not found'
            })
        }

        const countReturnData = await db('inventaris_return')
            .where('id_output', getData.id)
            .sum({
                good: 'kondisi_bagus',
                lightBroken: 'kondisi_rusak_ringan',
                heavyBroken: 'kondisi_rusak_berat',
                lost: 'kondisi_hilang'
            })
            .first()

        // untuk menghitung minimal output edit
        const { good, lightBroken, heavyBroken, lost } = countReturnData
        const sumMinQuantity = 0 + good + lightBroken + heavyBroken + lost

        return res.json({
            data: dataMapping.output(getData),
            itemData: dataMapping.item(getItemData),
            detail: {
                returnData: {
                    good: good ?? 0,
                    lightBroken: lightBroken ?? 0,
                    heavyBroken: heavyBroken ?? 0,
                    lost: lost ?? 0
                },
                minQuantity: sumMinQuantity > 0 ? sumMinQuantity : 1,
                availableStockFromReturn: 0 + good + lightBroken,
                availableAddReturn: getData.kuantitas - sumMinQuantity,
            }
        })

    } catch (error) {
        next(error)
    }
}

// cari inventaris output berdasarkan id input
const getOutputByInputId = async(req,res,next) => {
    try {

        const getInputData = await db('inventaris_input')
            .where('id', req.params.id)
            .first()

        if (!getInputData) {
            throw new sendError({
                status:400,
                code: 'INPUT_DATA_NOT_FOUND',
                message:'Input data with given id was not found'
            })
        }

        const getData = await db('inventaris_output')
            .where({
                nomor_input: getInputData.nomor_input
            })
            .orderBy('tanggal','desc')
            .paginate(pagination(req.page,req.limit));

        getData.data = getData.data.map(dataMapping.output)

        return res.json(getData)
    } catch (error) {
        next(error)
    }
}

// insert inventaris output berdasarkan id input
const postOutputByInputId = async(req,res,next) => {
    try {
        const { quantity, user, staff, description } = req.body

        const generateOutputCode = async() => {
            try {
                let generateCode = randomString(10).toUpperCase()
                let getOutput = await db('inventaris_output').where('nomor_output',generateCode).first()
                if (getOutput) {
                    generateOutputCode()
                } else {
                    return generateCode
                }
            } catch (error) {
                throw new sendError({
                    code:'ERR_GENERATE_OUTPUT_CODE',
                    message: 'Error when generating output code'
                })
            }
        }

        const getInputData = await db('inventaris_input')
            .where({
                id: req.params.id
            })
            .first()

        if (!getInputData) {
            throw new sendError({
                status:400,
                code: 'INPUT_DATA_NOT_FOUND',
                message:'Input data with given id was not found'
            })
        }

        const getStaff = await db('dbstaff').where('email', req.body.staff).first()
        if (!getStaff) {
            throw new sendError({
                status:400,
                code:'STAFF_NOT_FOUND',
                message: 'Staff with email given not found'
            })
        }

        const getUser = await db('dbstaff').where('email', req.body.user).first()
        if (!getUser) {
            throw new sendError({
                status:400,
                code:'OPERATOR_NOT_FOUND',
                message: 'User/operator with email given not found'
            })
        }

        const calculator = await transactionCalculator(getInputData)

        if (!calculator) {
            throw new sendError({
                status:500,
                code:'ERR_CALCULATING_TRANSACTION',
                message: 'Error when calculating transaction data'
            })
        }

        if (calculator.quantity.availableOutput < 1) {
            throw new sendError({
                status:400,
                code:'ADD_OUTPUT_UNAVAILABLE',
                message: 'Cannot add output for this input data'
            })
        }

        if (quantity > calculator.quantity.availableOutput) {
            throw new sendError({
                status:400,
                code:'DATA_EXCEEDED',
                message: 'Quantity exceeds available output quantity'
            })
        }

        const generatedOutputCode = await generateOutputCode()

        const inserting = await db('inventaris_output').insert({
            nomor_output: generatedOutputCode,
            nomor: getInputData.nomor,
            nomor_input: getInputData.nomor_input,
            kuantitas: quantity,
            pengguna: user,
            staff: staff,
            deskripsi: description ? description : ''
        })

        return res.json({
            message: 'OK',
            data: inserting
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    inventarisIndex,
    loginAuth,
    getAllBarang,
    getBarangById,
    putBarangById,
    postBarang,
    getCategory,
    getCategoryById,
    getReturnByOutputId,
    getReturnById,
    postReturn,
    getInput,
    getInputById,
    getInputByIdBarang,
    postInputByIdBarang,
    putInputById,
    getOutputByIdBarang,
    getOutput,
    getOutputById,
    getOutputByInputId,
    postOutputByInputId,
    putOutputById,
    getDivision,
    getWarehouse,
    getStaff,
    getWarehouseById,
    getDivisionById,
    getAuditByIdBarang
}