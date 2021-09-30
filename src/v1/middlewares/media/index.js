const { sendError } = require("../../utils")
const db = require('../../../../lib/db');
const mediaMapping = require("./mediaMapping");
const rootDir = require("../../../../lib/rootDir");
const path = require('path')
const fs = require('fs')

const index = (req,res) => {
    return res.json({
        route: 'media'
    })
}

const showMediaByName = async(req,res,next) => {
    try {
        const getRootDir = await rootDir()
        const getData = await db('media').where({ nama: req.params.name }).first()

        if (!getData) {
            throw new sendError({
                status:404,
                code: 'NOT_FOUND',
                message: 'Media not found'
            })
        }

        const mediaPath = path.join(
    getRootDir,
    'media',
    'upload'
        )
        const notFoundImage = path.join(getRootDir,'media','image-not-found.jpg')
        const realMediaPath = fs.existsSync(path.join(mediaPath, getData.nama)) ? path.join(mediaPath, getData.nama) : path.join(notFoundImage)

        return res.sendFile(realMediaPath)
    } catch (error) {
        next(error)
    }
}

const getMediaByImage = async(req,res,next) => {
    try {
        const getData = await db('media').where({ jenis: 'image' })
        let showUrl = req.fullUrl.split('/')
        showUrl.pop()

        return res.json(getData.map(item => mediaMapping(item, showUrl.join('/') + '/')))
    } catch (error) {
        next(error)
    }
}

const postMedia = async(req,res,next) => {

    // this is a static variable for database field 'jenis'
    const jenis = 'image'

    const { title, description } = req.body

    try {
        const file = req.file.path;
        if (!file) {
            throw new sendError({
                status: 500,
                code: 'ERR_UPLOAD_FILE',
                message: 'Error when uploading file'
            })
        }

        const dataToInsert = {
            nama: req.file.filename,
            judul: title ?? req.file.filename,
            jenis: jenis,
            deskripsi: description ?? 'Tidak ada deskripsi'
        }

        const inserting = await db('media')
            .insert(dataToInsert)

        if (!inserting) {
            throw new sendError({
                code:'ERR_INSERT_DATA',
                message:'Error inserting data to database'
            })
        }

        return res.json({
            success:true,
            ...dataToInsert
        })
        
    } catch (error) {
        next(error)
    }
}

module.exports = {
    index,
    showMediaByName,
    getMediaByImage,
    postMedia
}