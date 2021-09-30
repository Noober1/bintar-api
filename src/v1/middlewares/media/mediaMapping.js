module.exports = (item, url = '') => {
    return {
        id: item.id,
        name: item.nama,
        url: url + item.nama,
        type: item.jenis,
        dateCreated: item.tanggal_dibuat
    }
}