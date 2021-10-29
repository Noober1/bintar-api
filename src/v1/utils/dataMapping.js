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
        firstName: item.nama_depan.toLowerCase(),
        lastName: item.nama_belakang.toLowerCase(),
        fullName: (item.nama_depan + ' ' + item.nama_belakang).toLowerCase(),
        status: item.status,
        type: item.jenis,
        class: {
            name: item.kelas_nama,
            semester: item.semester,
            angkatan: item.kelas_angkatan
        },
        prodi: {
            code: item.prodi_kode,
            name: item.prodi_nama
        }
    })
}