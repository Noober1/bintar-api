module.exports = {
    user: item => ({
        id:item.id,
        firstName:item.nama_depan,
        lastName:item.nama_belakang,
        fullName: (item.nama_depan + ' ' + item.nama_belakang).toLowerCase(),
        email:item.email,
        level:item.level,
        status:item.status_user,
        permission:JSON.parse(item.hak_akses) || [],
        lastLogin:item.last_login,
        lastLogout:item.last_logout
    }),
    /* structure for mahasiswa
    {
        "id": number,
        "nama_depan": "string",
        "nama_belakang": "string",
        "email": "string",
        "status": "string",
        "kelas_nama": "string",
         "kelas_semester": "number",
         "kelas_angkatan": "number",
         "prodi_kode": "string",
         "prodi_nama": "string"
      }
    */
    mahasiswa: item => ({
        id: item.id,
        NIS: item.NIS,
        firstName: item.nama_depan.toLowerCase(),
        lastName: item.nama_belakang.toLowerCase(),
        fullName: (item.nama_depan + ' ' + item.nama_belakang).toLowerCase(),
        status: item.status,
        email: item.email,
        type: item.jenis,
        registerYear: item.tahun_masuk,
        class: {
            id: item.kelas_id,
            name: item.kelas_nama,
            semester: item.semester,
            angkatan: item.kelas_angkatan
        },
        prodi: {
            id: item.prodi_id,
            code: item.prodi_kode,
            name: item.prodi_nama
        }
    }),
    kelas: item => ({
        id: item.id,
        name: item.nama,
        semester: item.semester,
        angkatan: item.angkatan
    }),
    prodi: item => ({
        id: item.id,
        code: item.kode,
        name: item.nama
    }),
    // mapping for administrasi
    payment: item => ({
        id: item.id,
        registerDate: item.tanggal,
        admin: {
            firstName: item.admin_nama_depan,
            lastName: item.admin_nama_belakang,
            fullName: item.admin_nama_depan + ' ' + item.admin_nama_belakang,
            email: item.admin_email
        },
        type: item.jenis,
        price: item.nominal,
        description: item.deskripsi
    }),
    invoice: item => ({
        id: item.id,
        code: item.code,
        student: {
            firstName: item.mahasiswa_nama_depan,
            lastName: item.mahasiswa_nama_belakang,
            fullName: item.mahasiswa_nama_depan + ' ' + item.mahasiswa_nama_belakang,
            email: item.mahasiswa_email,
            class: item.mahasiswa_kelas_nama
        },
        status: item.status,
        paymentMethod: item.jenis_pembayaran,
        accountNumber: item.no_rekening,
        destinationAccount: item.tujuan_rekening,
        date: {
            invoice: item.tanggal_invoice,
            transaction: item.tanggal_transaksi,
            verification: item.tanggal_verifikasi
        },
        refNumber: item.nomor_ref,
        picture: item.gambar
    })
}