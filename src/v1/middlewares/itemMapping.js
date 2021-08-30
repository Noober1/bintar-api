module.exports = {
    itemData: item => {
        return {
            id:item.id,
            code:item.nomor,
            name:item.nama,
            brand:item.merk,
            model:item.model,
            category:item.kategori,
            description:item.deskripsi,
            returnable:item.returnable == 'Y',
            unit:item.satuan,
            dateCreated:item.tanggal_dibuat
        }
    }
}