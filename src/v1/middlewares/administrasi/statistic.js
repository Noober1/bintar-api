const { sendError } = require("../../utils")
const db = require('../../../../lib/db');
const pagination = require("../../../../lib/pagination");
const httpStatus = require("http-status");
const { STUDENT_DB, INVOICE_DB } = require("../../constants");
const routes = {}

routes.getDashboardStatistic = async(req,res,next) => {
    try {
        const getStudentData = await db(STUDENT_DB).select(['id','email']).where('email', req.auth.email).first()
        if (req.auth.accountType == 'student' && !getStudentData) {
            throw new sendError({
                status: httpStatus.NOT_FOUND,
                code: 'ERR_STUDENT_NOT_FOUND',
                message: `You're not listed in student database, that's weird :/`
            })
        }

        const _getInvoiceByStatus = status => {
            let whereQuery = req.auth.accountType === 'student' ? {
                mahasiswa: getStudentData.id,
                status
            } : {
                status
            }
            return db(INVOICE_DB)
            .count('id as count')
            .where(whereQuery)
            .first()
        }

        // get data from database
        const getVerifyingInvoiceData = await _getInvoiceByStatus('confirming')
        const getInvalidInvoiceData = await _getInvoiceByStatus('invalid')
        const getPendingInvoiceData = await _getInvoiceByStatus('pending')
        const getPaidInvoiceData = await _getInvoiceByStatus('paid')
        const getUnpaidInvoiceData = await _getInvoiceByStatus('unpaid')

        // statistic data
        const statistic = {
            paid: getPaidInvoiceData.count,
            verifying: getVerifyingInvoiceData.count,
            pending: getPendingInvoiceData.count,
            invalid: getInvalidInvoiceData.count,
            unpaid: getUnpaidInvoiceData.count
        }

        const getTotalInvoiceData = Object.keys(statistic).reduce((prev, item) => {
            return prev + statistic[item]
        }, 0)

        return res.json({
            statistic: {
                ...statistic,
                total: getTotalInvoiceData
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = routes