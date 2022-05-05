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
    getTeachingClassByNH(teacherID, limit, offset, NH) {
        return db('ctgiangday').where('MaGV', teacherID)
            .join('lophoc', 'lophoc.MaLop', 'ctgiangday.MaLop')
            .where('NamHoc', NH)
            .join('monhoc', 'MonHoc', 'MaMon').limit(limit).offset(offset)
    },
    async countTeachingClassByNH(teacherID, NH) {
        const result = await db('ctgiangday').where('MaGV', teacherID)
            .join('lophoc', 'lophoc.MaLop', 'ctgiangday.MaLop')
            .where('NamHoc', NH).count('*')
        return result[0]['count(*)']
    },
    findTeachingYears(teacherID) {
        return db('ctgiangday').where('ctgiangday.MaGV', teacherID)
            .join('lophoc', 'lophoc.MaLop', 'ctgiangday.MaLop')
            .select('NamHoc')
            .groupBy('NamHoc')
            .orderBy('NamHoc', 'desc')
    },
    getAchievementsByHKNH(classID, limit, offset, HK, NH) {
        return db('ctthanhtich').join('thanhtich', 'ctthanhtich.MaThanhTich', 'thanhtich.MaThanhTich')
            .join ('hocsinh', 'ctthanhtich.MaHocSinh', 'hocsinh.MaHocSinh')
            .where ('ThuocLop', classID)
            .where('HocKy', HK)
            .where('NamHoc', NH).limit(limit).offset(offset)
    },
    async countAchievementsByHKNH(classID, HK, NH)  {
        const result = await db('ctthanhtich').join('thanhtich', 'ctthanhtich.MaThanhTich', 'thanhtich.MaThanhTich')
            .join ('hocsinh', 'ctthanhtich.MaHocSinh', 'hocsinh.MaHocSinh')
            .where ('ThuocLop', classID)
            .where('HocKy', HK)
            .where('NamHoc', NH).count('*')
        return result[0]['count(*)']
    },
    updateAchievement(entity, studentID, achievementID) {
        return db('ctthanhtich')
            .where('MaHocSinh', '=', studentID)
            .where('MaThanhTich', '=', achievementID)
            .update(entity)
    },
    removeAchievement(studentID, achievementID) {
        return db('ctthanhtich')
            .where('MaHocSinh', '=', studentID)
            .where('MaThanhTich', '=', achievementID)
            .delete()
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