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
}