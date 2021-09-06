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
    division: item => ({
        id:item.id,
        name:item.nama,
        description:item.deskripsi
    }),
    input: item => ({
        transactionType:'input',
        id:item.id,
        code:item.nomor,
        inputCode:item.nomor_input,
        quantity:item.kuantitas,
        user:item.pengguna,
        description:item.deskripsi,
        division:item.divisi,
        dateCreated:item.tanggal
    }),
    output: item => ({
        transactionType:'output',
        id:item.id,
        code:item.nomor,
        inputCode:item.nomor_input,
        quantity:item.kuantitas,
        user:item.pengguna,
        staff:item.staff,
        description:item.deskripsi,
        dateCreated:item.tanggal
    }),
}