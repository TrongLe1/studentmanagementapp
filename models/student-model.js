import db from '../utils/db-connection.js'
import subjectModel from "./subject-model.js";

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
    getStudentScoresInSubjectByHKNH(studentID, subjectID, HocKy, NamHoc) {
        return db('diem').where('MaHocSinh', studentID)
            .where('MaMon', subjectID)
            .where('HocKy', HocKy)
            .where('NamHoc', NamHoc)
            .orderBy('HeSoDiem', "asc")
    },
    async getListSubjectScoresByHKNH(studentID, HK, NH) {
        let list = await db('diem').where('MaHocSinh', studentID)
            .where('HocKy', HK)
            .where('NamHoc',NH)
            .select('MaMon').groupBy('MaMon')
        for(let idx in list){
            let subjectInfo = await subjectModel.findSubject(list[idx].MaMon)
            let subjectScores = await this.getStudentScoresInSubjectByHKNH(studentID, list[idx].MaMon, HK, NH)
            list[idx].TenMonHoc = subjectInfo[0].TenMonHoc
            list[idx].scores = subjectScores
        }
        return list
    },
    async getStudentScoresByHKNH(studentID, HK, NH) {
        let list = await db('diem').where('MaHocSinh', studentID)
            .where('HocKy', HK)
            .where('NamHoc',NH)
            .orderBy('MaMon', "asc")
            .orderBy('HeSoDiem','asc')
        for(let idx in list){
            let subjectInfo = await subjectModel.findSubject(list[idx].MaMon)
            list[idx].TenMonHoc = subjectInfo[0].TenMonHoc
        }
        return list
    },
    getChooseSemesterAndYearList(studentID){
        return db('diem').where('MaHocSinh',studentID).groupBy('HocKy', 'NamHoc')
            .select('HocKy','NamHoc')
            .orderBy('NamHoc',"desc")
            .orderBy('HocKy',"desc")
    },
    addStudentScore(entity) {
        return db('diem').insert(entity)
    },
    updateStudentScore(entity, id) {
        return db('diem').where('MaDiem', '=', id).update(entity)
    },
    async updateMistake(entity, score, studentID) {
        const res = await db('thanhtich').where('thanhtich.TenHoatDong', entity.TenHoatDong)
        const existsAchievement = !(res.length === 0)
        if (!existsAchievement) {
            const id = await db('thanhtich').insert(entity)
            return db('vipham').insert({
                MaThanhTich: id,
                DiemTru: score
            })
            await db('ctthanhtich').insert({
                MaThanhTich: id,
                MaHocSinh: studentID,
                SoLanThamGia: 1
            })
        } else {
            const id = res[0].MaThanhTich
            await db('ctthanhtich').insert({
                MaThanhTich: id,
                MaHocSinh: studentID,
                SoLanThamGia: 1
            })
        }
    },
    async updateMerit(entity, score, studentID) {
        const id = await db('thanhtich').insert(entity)
        const result = await db('ctthanhtich').join('thanhtich', 'thanhtich.MaThanhTich', 'ctthanhtich.MaThanhTich')
            .where('thanhtich.TenHoatDong', entity.TenHoatDong)
            .count('*')
        const count = result[0]['count(*)']
        await db('ctthanhtich').insert({
            MaThanhTich: id,
            MaHocSinh: studentID,
            SoLanThamGia: count
        })
        return db('khenthuong').insert({
            MaThanhTich: id,
            DiemCong: score
        })
    },
    async markAbsentStudent(entity, id) {
        await this.updateMistake(entity, 5, id)
    },
    async checkAbsent(studentID, today) {
        const result = await db('ctthanhtich').join('thanhtich', 'thanhtich.MaThanhTich', 'ctthanhtich.MaThanhTich')
            .where('thanhtich.TenHoatDong', 'Vắng học')
            .where('ctthanhtich.MaHocSinh', studentID)
            .where('thanhtich.NgayDienRa', today)
        return !(result.length === 0);
    }
}
