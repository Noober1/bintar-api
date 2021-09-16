const isJSON = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

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
    warehouse: item => ({
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
        storedAt:item.tempat_disimpan,
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
    audit: item => ({
        transactionType:'audit',
        id:item.id,
        itemCode:item.nomor,
        inputCode:item.nomor_input,
        user:item.pengguna,
        quantity:item.kuantitas,
        itemLightBroken:item.barang_rusak_ringan,
        itemHeavyBroken:item.barang_rusak_ringan,
        itemLost:item.barang_hilang,
        description:item.deskripsi,
        dateCreated:item.tanggal
    }),
    log: item => ({
        id: item.id,
        date: item.date,
        name: item.name,
        data: isJSON(item.data) ? JSON.parse(item.data) : item.data
    })
}