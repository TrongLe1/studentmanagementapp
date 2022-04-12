import db from '../utils/db-connection.js'

export default {
    addTeacher(entity) {
        return db('giaovien').insert(entity)
    },
    getTeacher(limit, offset) {
        return db.select('*').from('giaovien').limit(limit).offset(offset)
    },
    async countTeacher() {
        const result = await db('giaovien').count('*')
        return result[0]['count(*)']
    },
    findTeacherById(id) {
        return db.select('*').from('giaovien').where('MaGV', '=', id)
    },
    updateTeacher(entity, id) {
        return db('giaovien').where('MaGV', '=', id).update(entity)
    },
    deleteTeacher(id) {
        return db('giaovien').where('MaGV', '=', id).del()
    },
    createAccount(accountId, id) {
        return db('giaovien').where('MaGV', '=', id).update({TaiKhoan: accountId})
    }
}