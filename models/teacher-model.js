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
    findTeacherAccount(accountID) {
        return db('giaovien').where('TaiKhoan', accountID)
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
    async assignHomeroomTeacher(teacherId, classId) {
        await db('giaovien').where('MaGV', '=', teacherId).update({ChuNhiemLop: classId})
        const result = await db.select('*').from('giaovien').where('MaGV', '=', teacherId)
        return db('taikhoan').where('MaTaiKhoan', '=', result[0].TaiKhoan).update({LoaiTaiKhoan: 3})
    },
    findHomeroomTeacher(classId) {
        return db.select('*').from('giaovien').where('ChuNhiemLop', '=', classId)
    },
    async removeHomeroomTeacherFromClass(classId) {
        const result = await db.select('*').from('giaovien').where('ChuNhiemLop', classId)
        await db('giaovien').where('ChuNhiemLop', classId).update({ChuNhiemLop: null})
        if (result.length !== 0)
            return db('taikhoan').where('MaTaiKhoan', '=', result[0].TaiKhoan).update({LoaiTaiKhoan: 1})
    },
    getAllTeacher() {
        return db.select('*').from('giaovien')
    },
    getAllTeacherWithout(teachers) {
        return db('giaovien').whereNotIn('MaGV', teachers)
    },
    getTeachingClass(teacherID, limit, offset) {
        return db('ctgiangday').where('MaGV', teacherID).join('lophoc', 'lophoc.MaLop', 'ctgiangday.MaLop')
            .join('monhoc', 'MonHoc', 'MaMon').limit(limit).offset(offset)
    },
    async countTeachingClass(teacherID) {
        const result = await db('ctgiangday').where('MaGV', teacherID).count('*')
        return result[0]['count(*)']
    },
    getAchievements(limit, offset) {
        return db('thanhtich').limit(limit).offset(offset)
    },
    async countAchievements() {
        const result = await db('thanhtich').count('*')
        return result[0]['count(*)']
    },
    removeAchievement(id) {
        return db('thanhtich').where('MaThanhTich', '=', id).delete()
    },
    async searchTeacherByName(keyword, limit, offset) {
        const result = await db.raw(`SELECT *
                                     FROM giaovien
                                     WHERE MATCH (HoTen) AGAINST('${keyword}') LIMIT ${limit} OFFSET ${offset};`)
        return result[0]

    },
    async countSearchTeacher(keyword) {
        const result = await db.raw(`SELECT COUNT(*)
                                     FROM giaovien
                                     WHERE MATCH (HoTen) AGAINST('${keyword}');`)
        return result[0][0]['COUNT(*)']
    }
}