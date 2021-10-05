const { media } = require("../middlewares")
const express = require('express');
const router = express.Router()
const cache = require('../../../lib/cache')
const path = require('path')
const multer = require('multer');
const rootDir = require("../../../lib/rootDir");
const { sendError, checkPageAndLimit } = require("../utils");
const fs = require('fs')

// uploader
const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
]

const fileFilter = (req, file, cb) => {
    if (!whitelist.includes(file.mimetype)) {
        return cb(new sendError({
            status:400,
            code: 'FILE_NOT_ALLOWED',
            message: 'File format not allowed'
        }))
    }
    return cb(null,true)
}

const diskStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const getRootDir = await rootDir()
        const getUploadDir = path.join(getRootDir, "/media/upload");
        if (!fs.existsSync(getUploadDir)) fs.mkdirSync(getUploadDir)
        cb(null, getUploadDir);
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    }
});

router
    .route('/')
    .get(media.index)
    .post(
        multer({ storage: diskStorage, fileFilter:fileFilter }).single("file"),
        media.postMedia
    )

router
    .route('/image')
    .get(checkPageAndLimit, media.getMediaByImage)

router
    .route('/:name')
    .get(media.showMediaByName)


module.exports = router