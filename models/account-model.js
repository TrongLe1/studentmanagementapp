import db from '../utils/db-connection.js'

export default {
    createTeacherAccount(entity) {
        return db('taikhoan').insert(entity)
    },
    findAccountByUsername(user) {
        return db('taikhoan').where({TenDangNhap: user}).select('*')
    }
}