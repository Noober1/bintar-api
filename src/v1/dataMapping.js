module.exports = {
    item: item => ({
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
    }),
    category: item => ({
        id:item.id,
        name:item.nama,
        description:item.deskripsi
    }),
    input: item => ({
        transactionType:'input'
    })
}