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
    },
    getNotHomeroomTeacher() {
        return db.select('*').from('giaovien').whereNull('ChuNhiemLop')
    },
    assignHomeroomTeacher(teacherId, classId) {
        return db('giaovien').where('MaGV', '=', teacherId).update({ChuNhiemLop: classId})
    },
    findHomeroomTeacher(classId) {
        return db.select('*').from('giaovien').where('ChuNhiemLop', '=', classId)
    },
    removeHomeroomTeacherFromClass(classId) {
        return db('giaovien').where('ChuNhiemLop', classId).update({ChuNhiemLop: null})
    },
    getAllTeacher() {
        return db.select('*').from('giaovien')
    },
    getAllTeacherWithout(teachers) {
        return db('giaovien').whereNotIn('MaGV', teachers)
    },
}