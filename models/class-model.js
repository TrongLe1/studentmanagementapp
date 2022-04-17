import db from '../utils/db-connection.js'

export default {
    addClass(entity) {
        return db('lophoc').insert(entity)
    },
    getClass(limit, offset) {
        return db.select('*').from('lophoc').limit(limit).offset(offset)
    },
    getAllClass() {
        return db.select('*').from('lophoc')
    },
    async countClass() {
        const result = await db('lophoc').count('*')
        return result[0]['count(*)']
    },
    getClassStudent(classID, limit, offset) {
        return db('hocsinh').where('ThuocLop', classID).limit(limit).offset(offset)
    },
    async countClassStudent(classID) {
        const result = await db('hocsinh').where('ThuocLop', classID).count('*')
        return result[0]['count(*)']
    },
    findClassById(id) {
        return db.select('*').from('lophoc').where('MaLop', '=', id)
    },
    editClass(classId, entity) {
        return db('lophoc').where('MaLop', classId).update(entity)
    },
    deleteClass(id) {
        return db('lophoc').where('MaLop', '=', id).del()
    },
    getTeacherInClass(id) {
        return db('ctgiangday').join('giaovien', 'ctgiangday.MaGV', '=', 'giaovien.MaGV').join('monhoc', 'ctgiangday.MonHoc', '=', 'monhoc.MaMon').where('MaLop', '=', id).select('*')
    },
    async countTeacherInClass(id) {
        const result = await db('ctgiangday').where('MaLop', '=', id).count('*')
        return result[0]['count(*)']
    },
    addDetailTeaching(entity) {
        return db('ctgiangday').insert(entity)
    },
    getTeacherIDInClass(id) {
        return db.select('MaGV').from('ctgiangday').where('MaLop', '=', id).pluck('MaGV')
    },
    getSpecificTeacherInClass(id, userId) {
        return db('ctgiangday').join('giaovien', 'ctgiangday.MaGV', '=', 'giaovien.MaGV').join('monhoc', 'ctgiangday.MonHoc', '=', 'monhoc.MaMon').where('MaLop', '=', id).where('ctgiangday.MaGV', '=', userId).select('*')
    },
    editDetailTeaching(classId, userId, subjectId) {
        return db('ctgiangday').where('MaLop', '=', classId).where('MaGV', '=', userId).update({MonHoc: subjectId})
    },
    removeTeachingInClass(classId, userId) {
        return db('ctgiangday').where('MaLop', '=', classId).where('MaGV', '=', userId).del()
    },
    removeAllTeacherFromClass(id) {
        return db('ctgiangday').where('MaLop', '=', id).del()
    }
}