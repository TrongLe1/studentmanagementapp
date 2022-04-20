import db from '../utils/db-connection.js'

export default {
    createAccount(entity) {
        return db('taikhoan').insert(entity)
    },
    findAccountByUsername(user) {
        return db('taikhoan').where({TenDangNhap: user}).select('*')
    },
    updateAccountById(id, account) {
        return db('taikhoan').where('MaTaiKhoan', '=', id).update(account)
    },
    deleteAccount(id) {
        return db('taikhoan').where('MaTaiKhoan', '=', id).del()
    },
    getAccount(limit, offset) {
        return db.select('*').from('taikhoan').limit(limit).offset(offset)
    },
    async countAccount() {
        const result = await db('taikhoan').count('*')
        return result[0]['count(*)']
    },
    lockAccount(id) {
        return db('taikhoan').where('MaTaiKhoan', '=', id).update({TrangThai: 0})
    },
    unlockAccount(id) {
        return db('taikhoan').where('MaTaiKhoan', '=', id).update({TrangThai: 1})
    }
}