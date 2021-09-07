const db = require('../../../lib/db')

const getConfig = async(req,res,next) => {
    try {
        const getData = await db('dbid')
            .first()

        if (!getData) {
            throw new Error('Something is wrong')
        }

        return res.json({
            schoolInfo:{
                name:getData.nama,
                address:getData.alamat,
                phone:getData.no_telpon,
                fax:getData.no_fax,
                email:getData.email,
                website:getData.website,
            },
            apps:{
                SAS:{
                    isActive:(getData.SAS_isActive == 'Y'),
                    isMaintenance: (getData.system_isMaintenance == 'Y')
                },
                PSB:{
                    isActive:(getData.PPDB_Status == 'active'),
                    activeYear:getData.PPDB_Tahun,
                    NoRegisterPattern:getData.PPDB_regex
                },
                inventaris: {
                    isActive:(getData.inventaris_status == 'aktif'),
                    NoItemPattern: getData.inventaris_nomor_regex
                }

            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getConfig
}