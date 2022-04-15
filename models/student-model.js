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
    findStudentById(matk) {
        return db('hocsinh').where('TaiKhoan', '=', matk)
    },
    updateStudent(entity, id) {
        return db('hocsinh').where('MaHocSinh', '=', id).update(entity)
    }
}