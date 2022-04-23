import db from '../utils/db-connection.js'

export default {
    addClass(entity) {
        return db('lophoc').insert(entity)
    },
    getClass(limit, offset) {
        return db.select('*').from('lophoc').leftJoin('giaovien', 'lophoc.MaLop', '=', 'giaovien.ChuNhiemLop').limit(limit).offset(offset)
    },
    getAllClass() {
        return db.select('*').from('lophoc')
    },
    async countClass() {
        const result = await db('lophoc').count('*')
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
    getTeacherInClass(id, limit, offset) {
        return db('ctgiangday').join('giaovien', 'ctgiangday.MaGV', '=', 'giaovien.MaGV').join('monhoc', 'ctgiangday.MonHoc', '=', 'monhoc.MaMon').where('MaLop', '=', id).select('*').limit(limit).offset(offset)
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
    },
    addTuition(entity) {
        return db('hocphi').insert(entity)
    },
    getTuitionInClass(id, limit, offset) {
        return db.select('*').from('hocphi').where('MaLop', '=', id).limit(limit).offset(offset)
    },
    async countTuitionInClass(id) {
        const result = await db('hocphi').where('MaLop', '=', id).count('*')
        return result[0]['count(*)']
    },
    getTuitionInClassSemester(id, semester, limit, offset) {
        return db.select('*').from('hocphi').where('MaLop', '=', id).where('HocKy', '=', semester).limit(limit).offset(offset)
    },
    async countTuitionInClassSemester(id, semester) {
        const result = await db('hocphi').where('MaLop', '=', id).where('HocKy', '=', semester).count('*')
        return result[0]['count(*)']
    },
    async sumTuitionInClass(id) {
        const result = await db('hocphi').sum('TongTien').where('MaLop', '=', id)
        return result[0]['sum(`TongTien`)']
    },
    async sumTuitionInClassSemester(id, semester) {
        const result = await db('hocphi').sum('TongTien').where('MaLop', '=', id).where('HocKy', '=', semester)
        return result[0]['sum(`TongTien`)']
    },
    deleteTuition(id) {
        return db('hocphi').where('MaHocPhi', '=', id).del()
    },
    findTuitionByID(id) {
        return db.select('*').from('hocphi').where('MaHocPhi', '=', id)
    },
    updateTuition(id, entity) {
        return db('hocphi').where('MaHocPhi', '=', id).update(entity)
    },
    findHomeroomClass(teacherID) {
        return db('giaovien').join('lophoc', 'lophoc.MaLop', 'giaovien.ChuNhiemLop')
            .where('MaGV', '=', teacherID)
    },
    removeTuitionFromClass(id) {
        return db('hocphi').where('MaLop', '=', id).del()
    },
    getClassYear() {
        return db('lophoc').distinct('NamHoc').orderBy('NamHoc', 'asc')
    },
    getClassByYear(limit, offset, year) {
        return db('lophoc').leftJoin('giaovien', 'lophoc.MaLop', '=', 'giaovien.ChuNhiemLop').where('NamHoc', '=', year).limit(limit).offset(offset)
    },
    async countClassByYear(year) {
        const result = await db('lophoc').where('NamHoc', '=', year).count('*')
        return result[0]['count(*)']
    },
}