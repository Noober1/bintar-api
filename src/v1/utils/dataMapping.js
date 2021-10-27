module.exports = {
    user: item => ({
        id:item.id,
        firstName:item.nama_depan,
        lastName:item.nama_belakang,
        email:item.email,
        level:item.level,
        status:item.status_user,
        permission:JSON.parse(item.hak_akses) || [],
        lastLogin:item.last_login,
        lastLogout:item.last_logout
    })
}