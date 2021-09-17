const db = require('../../../../lib/db')

/**
 * 
 * @param {*} getData - data input yang diambil dari database berdasarkan ID input
 * @param {string} type - berdasarkan nomor input(input) atau nomor barang(item)
 * @returns {object}
 */
const transactionCalculator = async(getData, type = 'input') => {
    let where,getInput;
    if (type === 'input') {
        where = {
            nomor_input: getData.nomor_input
        }
    } else if(type === 'item') {
        where = {
            nomor: getData.nomor
        }
        getInput = await db('inventaris_input')
            .sum({ count: 'kuantitas' })
            .where('nomor', getData.nomor)
            .first()
    } else {
        return false
    }

    try {
        // cari kalkukasi output berdasarkan nomor input
        const getOutput = await db('inventaris_output')
            .sum({ count: 'kuantitas' })
            .where(where)
            .first()

        // cari kalkukasi audit berdasarkan nomor input
        const getAudit = await db('inventaris_pemeriksaan')
            .sum({
                good: 'kondisi_bagus',
                lightBroken: 'kondisi_rusak_ringan',
                heavyBroken: 'kondisi_rusak_berat',
                lost: 'kondisi_hilang',
            })
            .where(where)
            .first()

        // cari kalkukasi audit berdasarkan nomor input
        const getReturn = await db('inventaris_return')
            .sum({
                good: 'kondisi_bagus',
                lightBroken: 'kondisi_rusak_ringan',
                heavyBroken: 'kondisi_rusak_berat',
                lost: 'kondisi_hilang',
            })
            .where(where)
            .first()


        // hitung barang yang bisa melakukan transaksi output kembali dari database audit
        // barang audit yang masih bisa dipakai = barang bagus di audit + barang rusak ringan di audit
        const auditReusable = getAudit.good + getAudit.lightBroken

        // hitung barang yang bisa melakukan transaksi output kembali dari database return
        // barang return yang masih bisa dipakai = barang bagus di return + barang rusak ringan di return
        // maka demikian, barang yang rusak berat, barang yang hilang, dan barang yang belum dikembalikan bukan termasuk barang yang dapat digunakan kembali
        const returnReusable = getReturn.good + getReturn.lightBroken

        // hitung barang yang TIDAK bisa melakukan transaksi output kembali dari database audit
        // barang yang tidak dapat digunakan kembali di audit = barang rusak berat di audit + barang hilang di audit
        const auditUnusable = getAudit.heavyBroken + getAudit.lost

        // hitung barang yang TIDAK bisa melakukan transaksi output kembali dari database return
        // barang yang tidak dapat digunakan kembali di return = barang rusak berat di return + barang hilang di return
        const returnUnusable = getAudit.heavyBroken + getAudit.lost

        // hitung barang yang bisa melakukan transaksi output kembali dari database
        // yang dapat digunakan kembali = audit yang dapat digunakan kembali + return yang dapat digunakan kembali
        // maka demikian, barang rusak berat, barang hilang dan barang yang belum dikembalikan tidak dapat digunakan sehingga tidak dapat ditambahkan ke barang yang dapat digunakan
        const reusable = auditReusable + returnReusable

        // hitung barang yang TIDAK bisa melakukan transaksi output kembali dari database
        // barang yang tidak dapat digunakan kembali = audit yang tidak dapat digunakan kembali + return yang tidak dapat digunakan kembali
        // sehingga barang rusak ringan dan bagus tidak ditambahkan. Barang rusak ringan dan bagus termasuk barang yang sudah dikembalikan atau di audit
        const unusable = auditUnusable + returnUnusable

        // hitung minimal kuantitas ketika edit data input
        // minimal kuantitas untuk edit input = total kuantitas barang di data output + audit yang dapat digunakan kembali + audit yang tidak dapat digunakan kembali
        // kalkulasi ini menjumlahkan data yang sudah masuk transaksi output dan audit saja
        const minQuantityForEditInput = getOutput.count + auditReusable + auditUnusable

        // hitung maksimal kuantitas untuk pengentrian data output baru
        // x = kuantitas input - (minimal kuantitas untuk input - barang yang dapat digunakan kembali)
        // barang yang tersedia untuk penambahan data output baru = total kuantitas barang pada data input - (minimal kuantitas ketidak edit data input - barang yang dapat digunakan kembali)
        const getAvailableOutput = getData.kuantitas - (minQuantityForEditInput - reusable)

        return {
            count: {
                input:getInput?.count ?? getInput,
                output: getOutput.count ?? 0,
                audit: {
                    good: getAudit.good ?? 0,
                    lightBroken: getAudit.lightBroken ?? 0,
                    heavyBroken: getAudit.heavyBroken ?? 0,
                    lost: getAudit.lost ?? 0,
                },
                return: {
                    good: getReturn.good ?? 0,
                    lightBroken: getReturn.lightBroken ?? 0,
                    heavyBroken: getReturn.heavyBroken ?? 0,
                    lost: getReturn.lost ?? 0,
                },
            },
            quantity:{
                min: minQuantityForEditInput > 0 ? minQuantityForEditInput : 1,
                availableOutput:getData.kuantitas ? getAvailableOutput : getData.kuantitas
            }
        }

    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = transactionCalculator