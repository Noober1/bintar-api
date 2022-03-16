const ExcelJS = require('exceljs')
const _ = require('lodash')

/**
 * Convert Excel file buffer to JSON
 * @param {*} buffer - File excel buffer
 * @returns {Object} - Excel data
 */
const excelToJson = async(buffer) => {
	const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)
    const data = []

    // reading data
    worksheet.eachRow({ includeEmpty:true }, (row, rowNumber) => {
        let item = []
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            item.push(cell.value ? typeof cell.value == 'string' ? cell.value.trim() : cell.value : '')
        })
        data.push(item)
    })

    const tableHeader = data[0]

    return {
        getData: () => {
            try {
                 // mapping into object with keys as keys and return it
                 return data.slice(1, data.length).map(item => {
                     let row = {}
                     tableHeader.forEach((element, index) => {
                         row[element] = item[index]
                     })
                     return row
                 })
            } catch (error) {
                return false
            }
        },
        getHeader: () => tableHeader,
        isValidTemplate: header => _.isEqual(tableHeader, header)
    }
}

module.exports = excelToJson