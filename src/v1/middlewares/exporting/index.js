const exporting = {}
const db = require('../../../../lib/db')
const { sendError } = require('../../utils')
const { STUDENT_DB, INVOICE_DB, PAYMENT_DB, USER_DB, INSTALMENT_DB, CLASS_DB } = require('../../constants')
const httpStatus = require('http-status')
const ExcelJS = require('exceljs');
const utils = require('../../../../lib/utils')
const _ = require('lodash')

const allBorderThin = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
}

const createExcel = (name = 'No name') => {
    // excel stuff begin
    const workbook = new ExcelJS.Workbook();
    workbook.creator = process.env.APP_NAME;
    workbook.created = new Date();
    const sheet = workbook.addWorksheet(name);
    return [workbook, sheet]
}

exporting.adminByStudent = async (req, res, next) => {
    const { nis } = req.params
    try {
        const findStudent = await db(STUDENT_DB).where('NIS', nis).first()
        if (!findStudent) {
            throw new sendError({
                status: httpStatus.NOT_FOUND,
                message: 'Student not found',
                code: 'ERR_STUDENT_NOT_FOUND'
            })
        }

        const getAllInvoiceByStudentId = await db(INVOICE_DB)
            .select([
                INVOICE_DB + '.id',
                INVOICE_DB + '.code',
                PAYMENT_DB + '.tanggal as pembayaran_tanggal',
                USER_DB + '.nama_depan as admin_nama_depan',
                USER_DB + '.nama_belakang as admin_nama_belakang',
                USER_DB + '.email as admin_email',
                PAYMENT_DB + '.jenis',
                PAYMENT_DB + '.nominal',
                PAYMENT_DB + '.deskripsi as pembayaran deskripsi',
                INVOICE_DB + '.status',
                INVOICE_DB + '.jenis_pembayaran',
                INVOICE_DB + '.no_rekening',
                INVOICE_DB + '.pembayar',
                INVOICE_DB + '.tujuan_rekening',
                INVOICE_DB + '.tanggal_invoice',
                INVOICE_DB + '.tanggal_transaksi',
                INVOICE_DB + '.tanggal_verifikasi',
                INVOICE_DB + '.nomor_ref',
                INVOICE_DB + '.gambar'
            ])
            .sum(INSTALMENT_DB + '.nominal as total_pembayaran')
            .innerJoin(PAYMENT_DB, function () {
                this.on(PAYMENT_DB + '.id', '=', INVOICE_DB + '.pembayaran')
            })
            .innerJoin(USER_DB, function () {
                this.on(USER_DB + '.email', '=', PAYMENT_DB + '.admin')
            })
            .innerJoin(INSTALMENT_DB, function () {
                this.on(INSTALMENT_DB + '.invoice', '=', INVOICE_DB + '.code')
            })
            .groupBy(INVOICE_DB + '.id', USER_DB + '.nama_depan', USER_DB + '.nama_belakang')
            .where(INVOICE_DB + '.mahasiswa', findStudent.id)

        const [workbook, sheet] = createExcel('Tagihan Mahasiswa')

        sheet.getRow(1).values = ['NIM', '', ': ' + findStudent.NIS]
        sheet.getRow(2).values = ['Nama Mahasiswa', '', ': ' + (findStudent.nama_depan + ' ' + findStudent.nama_belakang).toUpperCase()]
        sheet.mergeCells('A1', 'B1');
        sheet.mergeCells('A2', 'B2');
        sheet.getRow(3).values = ['']

        sheet.columns = [
            { key: 'id', width: 5 },
            { key: 'type', width: 25 },
            { key: 'paymentMethod', width: 17 },
            { key: 'nominal', width: 25 },
            { key: 'allPayment', width: 25 },
            { key: 'remaining', width: 25 },
        ]

        sheet.addRow({
            id: 'No',
            type: 'Jenis Tagihan',
            paymentMethod: 'Jenis Pembayaran',
            nominal: 'Nominal Tagihan',
            allPayment: 'Nominal Terbayar',
            remaining: 'Nominal Belum Terbayar'
        })

        let row = 1
        let totalPayment = 0
        let remaining = 0
        getAllInvoiceByStudentId.forEach((item, index) => {
            sheet.addRow({
                id: row,
                type: item.jenis,
                paymentMethod: item.jenis_pembayaran,
                nominal: item.nominal,
                allPayment: utils.rupiahFormatting(item.total_pembayaran || 0),
                remaining: utils.rupiahFormatting((item.nominal - item.total_pembayaran) || 0)
            })
            row++
            totalPayment = totalPayment + item.total_pembayaran
            remaining = remaining + (item.nominal - item.total_pembayaran)
        })
        sheet.addRow({
            id: '',
            type: '',
            paymentMethod: '',
            nominal: '',
            allPayment: 'Total: ' + utils.rupiahFormatting(totalPayment || 0),
            remaining: 'Total: ' + utils.rupiahFormatting(remaining || 0)
        }).font = {
            bold: true
        }

        sheet.eachRow(function (row, _rowNumber) {
            row.eachCell(function (cell, _colNumber) {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const contentHeader = `attachment; filename="Riwayat tagihan ${findStudent.nama_depan} ${findStudent.nama_belakang}(${findStudent.NIS}).xlsx"`
        return res
            .set('Content-Disposition', contentHeader)
            .send(buffer)
        // return res.json(getAllInvoiceByStudentId)
    } catch (error) {
        next(error)
    }
}

exporting.adminByPayment = async (req, res, next) => {
    try {
        const { id } = req.params

        const findPayment = await db(PAYMENT_DB)
            .select([
                PAYMENT_DB + '.id',
                PAYMENT_DB + '.tanggal',
                PAYMENT_DB + '.jenis',
                PAYMENT_DB + '.nominal',
                PAYMENT_DB + '.deskripsi',
                USER_DB + '.nama_depan as admin_nama_depan',
                USER_DB + '.nama_belakang as admin_nama_belakang'
            ])
            .innerJoin(USER_DB, function () {
                this.on(USER_DB + '.email', '=', PAYMENT_DB + '.admin')
            })
            .where(PAYMENT_DB + '.id', id)
            .first()
        if (!findPayment) {
            throw new sendError({
                status: httpStatus.NOT_FOUND,
                message: 'Payment not found',
                code: 'ERR_PAYMENT_NOT_FOUND'
            })
        }

        const getAllInvoiceByPaymentId = await db(INVOICE_DB)
            .select([
                INVOICE_DB + '.id',
                INVOICE_DB + '.code',
                INVOICE_DB + '.status',
                STUDENT_DB + '.NIS as mahasiswa_NIS',
                STUDENT_DB + '.nama_depan as mahasiswa_nama_depan',
                STUDENT_DB + '.nama_belakang as mahasiswa_nama_belakang',
                CLASS_DB + '.nama as kelas_nama'
            ])
            .sum(INSTALMENT_DB + '.nominal as total_pembayaran')
            .innerJoin(STUDENT_DB, function () {
                this.on(STUDENT_DB + '.id', '=', INVOICE_DB + '.mahasiswa')
            })
            .innerJoin(CLASS_DB, function () {
                this.on(CLASS_DB + '.id', '=', STUDENT_DB + '.kelas')
            })
            .leftJoin(INSTALMENT_DB, function () {
                this.on(INSTALMENT_DB + '.invoice', '=', INVOICE_DB + '.code')
            })
            .groupBy(INVOICE_DB + '.id', INVOICE_DB + '.pembayaran')
            .where(INVOICE_DB + '.pembayaran', findPayment.id)

        if (getAllInvoiceByPaymentId.length < 1) {
            throw new sendError({
                status: httpStatus.NOT_FOUND,
                message: 'Invoice with current payment is empty',
                code: 'ERR_INVOICE_EMPTY'
            })
        }

        const [workbook, sheet] = createExcel('Tagihan Per Jenis Pembayaran')

        let rowNumber = 1
        sheet.getRow(1).values = ['Tagihan Per Jenis Pembayaran']
        sheet.getRow(3).values = ['Jenis Pembayaran', '', findPayment.jenis]
        sheet.getRow(4).values = ['Pembuat Pembayaran', '', (findPayment.admin_nama_depan + ' ' + findPayment.admin_nama_belakang).toUpperCase()]
        sheet.getRow(5).values = ['Tanggal Pembuatan', '', new Date(findPayment.tanggal).formatter('d, D m Y')]
        sheet.getRow(6).values = ['Nominal Pembayaran', '', utils.rupiahFormatting(findPayment.nominal)]
        sheet.getRow(7).values = ['Deskripsi Pembayaran', '', findPayment.deskripsi]
        sheet.getRow(8).values = ['']
        sheet.mergeCells('A3', 'B3');
        sheet.mergeCells('A4', 'B4');
        sheet.mergeCells('A5', 'B5');
        sheet.mergeCells('A6', 'B6');
        sheet.mergeCells('A7', 'B7');
        sheet.mergeCells('C3', 'D3');
        sheet.mergeCells('C4', 'D4');
        sheet.mergeCells('C5', 'D5');
        sheet.mergeCells('C6', 'D6');
        sheet.mergeCells('C7', 'D7');
        sheet.columns = [
            { key: 'no', width: 5 },
            { key: 'invoice', width: 27 },
            { key: 'NIM', width: 15 },
            { key: 'fullName', width: 40 },
            { key: 'class', width: 25 },
            { key: 'nominal', width: 25 }
        ]
        sheet.addRow({
            no: 'No.',
            invoice: 'No. Tagihan',
            NIM: 'NIM',
            fullName: 'Nama Mahasiswa',
            class: 'Kelas',
            nominal: 'Nominal'
        })

        let totalNominal = 0
        getAllInvoiceByPaymentId.forEach((item, index) => {
            sheet.addRow({
                no: rowNumber,
                invoice: item.code,
                NIM: item.mahasiswa_NIS,
                fullName: item.mahasiswa_nama_depan + ' ' + item.mahasiswa_nama_belakang,
                class: item.kelas_nama,
                nominal: utils.rupiahFormatting(item.total_pembayaran || 0)
            })
            rowNumber++
            totalNominal = totalNominal + item.total_pembayaran
        })

        sheet.addRow({
            no: '',
            invoice: '',
            NIM: '',
            fullName: '',
            class: 'Total',
            nominal: utils.rupiahFormatting(totalNominal)
        }).font = {
            bold: true,
            underline: true
        }

        sheet.eachRow(function (row, _rowNumber) {
            row.eachCell(function (cell, _colNumber) {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const contentHeader = `attachment; filename="Riwayat tagihan '${findPayment.jenis}'.xlsx"`
        return res
            .set('Content-Disposition', contentHeader)
            .send(buffer)

        // return res.json(getAllInvoiceByPaymentId)
    } catch (error) {
        next(error)
    }
}

exporting.adminByIncome = async (req, res, next) => {
    // SELECT
    //     administrasi_mahasiswa.id,
    //     administrasi_mahasiswa.NIS,
    //     administrasi_mahasiswa.nama_depan,
    //     administrasi_mahasiswa.nama_belakang,
    //     administrasi_mahasiswa.status AS status_mahasiswa,
    //     administrasi_kelas_angkatan.nama as nama_kelas,
    //     administrasi_pembayaran.jenis as jenis_pembayaran,
    //     SUM(administrasi_cicilan.nominal) as nominal
    // FROM administrasi_mahasiswa
    // LEFT JOIN administrasi_invoice ON
    //     administrasi_mahasiswa.id = administrasi_invoice.mahasiswa
    // INNER JOIN administrasi_pembayaran ON
    //     administrasi_invoice.pembayaran = administrasi_pembayaran.id
    // INNER JOIN administrasi_kelas_angkatan ON
    //     administrasi_kelas_angkatan.id = administrasi_mahasiswa.kelas
    // INNER JOIN administrasi_cicilan ON
    //     administrasi_invoice.code = administrasi_cicilan.invoice
    // WHERE
    //     administrasi_invoice.status != 'unpaid'
    // GROUP BY
    //     administrasi_mahasiswa.id, administrasi_pembayaran.jenis
    // ORDER BY administrasi_mahasiswa.id 
    try {
        const { id } = req.params
        if (!id) {
            throw new sendError({
                status: httpStatus.BAD_REQUEST,
                message: 'Class ID is required',
                code: 'ERR_CLASS_ID_REQUIRED'
            })
        }
        const getStudentData = await db(STUDENT_DB)
            .select([
                STUDENT_DB + ".id",
                STUDENT_DB + ".NIS",
                STUDENT_DB + ".nama_depan",
                STUDENT_DB + ".nama_belakang",
                STUDENT_DB + ".status as status_mahasiswa",
                CLASS_DB + ".nama as kelas_nama",
                PAYMENT_DB + ".jenis as jenis_pembayaran",
                PAYMENT_DB + ".nominal as nominal_pembayaran"
            ])
            .sum(INSTALMENT_DB + '.nominal as nominal')
            .leftJoin(INVOICE_DB, STUDENT_DB + '.id', INVOICE_DB + '.mahasiswa')
            .innerJoin(PAYMENT_DB, INVOICE_DB + '.pembayaran', PAYMENT_DB + '.id')
            .innerJoin(CLASS_DB, STUDENT_DB + '.kelas', CLASS_DB + '.id')
            .innerJoin(INSTALMENT_DB, INVOICE_DB + '.code', INSTALMENT_DB + '.invoice')
            // .where(STUDENT_DB + '.kelas', id)
            .whereNot(INVOICE_DB + '.status', 'unpaid')
            .groupBy(STUDENT_DB + '.id ', PAYMENT_DB + '.jenis', PAYMENT_DB + '.nominal')
            .orderBy(STUDENT_DB + '.id')

        if (!getStudentData.length) {
            throw new sendError({
                status: httpStatus.NOT_FOUND,
                message: 'Tidak ada data',
                code: 'ERR_NO_DATA'
            })
        }

        let indicator = "", total = 0;
        const remapData = getStudentData.map(item => {
            // jika indikator tidak sama dengan data sekarang
            if (indicator !== item.NIS) {
                // filter data dari NIM saat ini
                let getDataFromSameNIS = getStudentData.filter(data => data.NIS == item.NIS)
                // jumlahkan nominal dari NIM yang sama
                let nominal = _.sumBy(getDataFromSameNIS, count => count.nominal)
                // insert ke total
                item.total = nominal
                // set indikator dengan NIM saat ini
            } else {
                // jika indikator sama dengan data sekarang, tinggal masukan total saja
                item.total = total
            }

            // return data yang sudah dimodifikasi
            return item
        })

        // return res.json(remapData)

        const workBookContext = 'Rekap dana masuk kelas ' + getStudentData[0].kelas_nama
        const [workbook, sheet] = createExcel(workBookContext)

        let rowNumber = 1
        sheet.getRow(1).values = [workBookContext]
        sheet.getRow(3).values = ['']
        sheet.mergeCells('A1', 'C1');

        sheet.columns = [
            { key: 'no', width: 5 },
            { key: 'NIM', width: 15 },
            { key: 'fullName', width: 40 },
            { key: 'class', width: 40 },
            { key: 'type', width: 25 },
            { key: 'nominal', width: 25 },
            { key: 'remaining', width: 25 },
            { key: 'total', width: 25 },
        ]
        sheet.addRow({
            no: 'No.',
            NIM: 'NIM',
            fullName: 'Nama Mahasiswa',
            class: 'Kelas',
            type: 'Jenis Pembayaran',
            nominal: 'Nominal',
            remaining: 'Sisa',
            total: 'Total Masuk',
        })

        const tableDataRowStart = 5;
        let indicatorNominal = ""
        remapData.forEach((item, index) => {
            if (item.NIS == indicatorNominal) {
                sheet.addRow({
                    no: rowNumber,
                    type: item.jenis_pembayaran,
                    nominal: utils.rupiahFormatting(item.nominal || 0),
                    remaining: utils.rupiahFormatting(item.nominal_pembayaran - item.nominal || 0),
                })
            } else {
                sheet.addRow({
                    no: rowNumber,
                    NIM: item.NIS,
                    fullName: item.nama_depan,
                    class: item.kelas_nama,
                    type: item.jenis_pembayaran,
                    nominal: utils.rupiahFormatting(item.nominal || 0),
                    remaining: utils.rupiahFormatting(item.nominal_pembayaran - item.nominal || 0),
                    total: utils.rupiahFormatting(item.total || 0)
                })
            }

            if (indicatorNominal !== item.NIS) {
                indicatorNominal = item.NIS
            }
            rowNumber++
        })

        sheet.eachRow(function (row, _rowNumber) {
            row.eachCell(function (cell, _colNumber) {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const contentHeader = `attachment; filename="Riwayat tagihan '${workBookContext}'.xlsx"`
        return res
            .set('Content-Disposition', contentHeader)
            .send(buffer)

        // res.json(remapData)
    } catch (error) {
        next(error)
    }
}

module.exports = exporting