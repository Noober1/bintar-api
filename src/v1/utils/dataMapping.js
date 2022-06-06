const _sumPaymentHistory = array => array.reduce((value, i) => value + i.nominal, 0)

const _instalment = item => ({
    id: item.id,
    invoice: item.invoice,
    admin: item.admin,
    payer: item.pembayar,
    nominal: item.nominal,
    paymentMethod: item.metode_pembayaran,
    date: {
        transaction: item.tanggal_transaksi,
        verification: item.tanggal_verifikasi
    }
})

module.exports = {
    user: item => ({
        id: item.id,
        firstName: item.nama_depan,
        lastName: item.nama_belakang,
        fullName: (item.nama_depan + ' ' + item.nama_belakang).toLowerCase(),
        email: item.email,
        level: item.level,
        status: item.status_user,
        permission: JSON.parse(item.hak_akses) || [],
        lastLogin: item.last_login,
        lastLogout: item.last_logout
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
            code: item.kelas_kode,
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
        code: item.kode,
        name: item.nama,
        semester: item.semester,
        angkatan: item.angkatan,
        isActive: item.status == 'aktif'
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
    }),
    invoiceDetail: item => ({
        id: item.id,
        code: item.code,
        student: {
            firstName: item.mahasiswa_nama_depan,
            lastName: item.mahasiswa_nama_belakang,
            fullName: item.mahasiswa_nama_depan + ' ' + item.mahasiswa_nama_belakang,
            email: item.mahasiswa_email,
            class: item.mahasiswa_kelas_nama
        },
        payment: {
            type: item.pembayaran_jenis,
            price: item.pembayaran_nominal,
            description: item.pembayaran_deskripsi,
            admin: {
                fullName: item.pembayaran_admin_nama_depan + ' ' + item.pembayaran_admin_nama_belakang,
                email: item.pembayaran_admin_email
            }
        },
        paymentHistory: item.cicilan.map(_instalment),
        totalPaymentHistory: _sumPaymentHistory(item.cicilan),
        remainingPaymentHistory: item.pembayaran_nominal - _sumPaymentHistory(item.cicilan),
        status: item.status,
        paymentMethod: item.jenis_pembayaran,
        accountNumber: item.no_rekening,
        sender: item.pembayar,
        destinationAccount: item.tujuan_rekening,
        maxInstalment: parseInt(process.env.MAX_CICILAN) || 6,
        date: {
            invoice: item.tanggal_invoice,
            transaction: item.tanggal_transaksi,
            verification: item.tanggal_verifikasi
        },
        refNumber: item.nomor_ref,
        picture: item.gambar
    }),
    instalment: _instalment,
    bankAccount: item => ({
        id: item.id,
        code: item.kode_bank,
        number: item.no_rekening,
        name: item.nama_bank,
        alias: item.nama_alias,
        owner: item.nama_pemilik
    }),
    // exporting
    adminByStudent: item => ({
        id: item.id,
        code: item.code,
        refNumber: item.no_ref,
        payment: {
            date: item.pembayaran_tanggal,
            description: item.pembayaran_deskripsi,
            admin: {
                firstName: item.admin_nama_depan,
                firstName: item.admin_nama_belakang,
                email: item.admin_email
            }
        },
        type: item.jenis,
        nominal: item.nominal,
        status: item.status,
        paymentMethod: item.jenis_pembayaran,
        accountNumber: item.no_rekening,
        payer: item.pembayar,
        destinationAccount: item.tujuan_rekening,
        date: {
            invoice: item.tanggal_invoice,
            transaction: item.tanggal_transaksi,
            verification: item.tanggal_verifikasi
        },
        picture: item.picture
    }),
    // PPDB bio
    ppdbBio: item => ({
        PPDBYear: item.PPDB_tahun,
        registerNumber: item.no_pendaftaran,
        registerDate: item.tanggal,
        email: item.email,
        phone: item.no_telpon,
        name: {
            firstName: item.nama_depan,
            lastName: item.nama_belakang,
            fullName: item.nama_depan + ' ' + item.nama_belakang,
            nickname: item.nama_panggilan,
            initial: item.nama_depan.charAt(0) + item.nama_belakang.charAt(0)
        },
        selectedMajor: item.jurusan_pilih,
        disease: {
            relapsingDisease: item.penyakit_kambuhan,
            seriousDisease: item.penyakit_berat,
        },
        numbers: {
            NISN: item.nisn,
            KIPKPS: item.kps_kip,
            examNumber: item.no_ujian,
            certificateNumber: item.no_ijazah,
            SKHUNNumber: item.no_skhun
        },
        parentPhone: item.no_telpon_ortu,
        birth: {
            place: item.tempat_lahir,
            date: item.tanggal_lahir,
        },
        religion: item.agama,
        nationality: item.kewarganegaraan,
        family: {
            childPosition: item.anak_ke,
            siblingCount: item.saudara_kandung,
            stepSiblingCount: item.saudara_tiri,
            adoptedSiblingCount: item.saudara_angkat,
            familyStatus: item.status_keluarga,
        },
        motherLanguage: item.bahasa_rumah,
        livingWith: item.tinggal_bersama,
        homeToSchoolDistance: item.jarak_sekolah,
        address: {
            street: item.alamat_kampung,
            village: {
                code: item.alamat_desa_id,
                name: item.alamat_desa_nama
            },
            district: {
                code: item.alamat_kecamatan_id,
                name: item.alamat_kecamatan_nama
            },
            city: {
                code: item.alamat_kabupaten_id,
                name: item.alamat_kabupaten_nama
            },
            province: {
                code: item.alamat_provinsi_id,
                name: item.alamat_provinsi_nama
            },
            postalCode: item.kode_pos
        },
        body: {
            sex: item.jenis_kelamin,
            weight: item.berat_badan,
            height: item.tinggi_badan,
            bloodType: item.golongan_darah,
        },
        lastEducation: {
            grade: item.pendidikan_terakhir,
            school: {
                code: item.asal_sekolah_kode,
                name: item.asal_sekolah_nama
            },
            graduateYear: item.sekolah_lulus,
        },
        father: {
            fullName: item.ayah_nama,
            birthDate: item.ayah_ttl,
            nationality: item.ayah_kewarganegaraan,
            education: item.ayah_pendidikan,
            occupation: item.ayah_pekerjaan,
            income: item.ayah_penghasilan,
            address: item.ayah_alamat
        },
        mother: {
            fullName: item.ibu_nama,
            birthDate: item.ibu_ttl,
            nationality: item.ibu_kewarganegaraan,
            education: item.ibu_pendidikan,
            occupation: item.ibu_pekerjaan,
            income: item.ibu_penghasilan,
            address: item.ibu_alamat
        },
        bioEditProgress: {
            basic: item.basic_edited == "Y",
            number: item.number_edited == "Y",
            advanced: item.advanced_edited == "Y",
            additional: item.additional_edited == "Y",
            address: item.address_edited == "Y",
            parent: item.parent_edited == "Y"
        }
    })
}