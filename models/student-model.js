import db from '../utils/db-connection.js'

export default {
    addStudent(entity) {
        return db('hocsinh').insert(entity)
    },
    getStudent(limit, offset) {
        return db.select('*').from('hocsinh').limit(limit).offset(offset)
    },
    async countStudent() {
        const result = await db('hocsinh').count('*')
        return result[0]['count(*)']
    },
    findStudentById(accountId) {
        return db('hocsinh').where('MaHocSinh', '=', accountId)
    },
    updateStudent(entity, id) {
        return db('hocsinh').where('MaHocSinh', '=', id).update(entity)
    },
    createAccount(accountId, id) {
        return db('hocsinh').where('MaHocSinh', '=', id).update({TaiKhoan: accountId})
    },
    getStudentInClass(classId, limit, offset) {
        return db.select('*').from('hocsinh').where('ThuocLop', '=', classId).limit(limit).offset(offset)
    },
    async countStudentInClass(classId) {
        const result = await db('hocsinh').where('ThuocLop', '=', classId).count('*')
        return result[0]['count(*)']
    },
    removeFromClass(id) {
        return db('hocsinh').where('MaHocSinh', '=', id).update({ThuocLop: null})
    },
    getStudentNotInClass() {
        return db('hocsinh').whereNull('ThuocLop')
    },
    removeAllStudentFromClass(id) {
        return db('hocsinh').where('ThuocLop', '=', id).update({ThuocLop: null})
    },
    getStudentScoresInSubject(studentID, subjectID) {
        return db('diem').where('MaHocSinh', studentID).where('MaMon', subjectID)
    }
}