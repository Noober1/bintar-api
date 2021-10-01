module.exports = (item, url = '') => {
    return {
        id: item.id,
        name: item.nama,
        title: item.judul,
        url: url + item.nama,
        type: item.jenis,
        dateCreated: item.tanggal_dibuat
    }
}