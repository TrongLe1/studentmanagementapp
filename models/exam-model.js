import db from '../utils/db-connection.js'
import subjectModel from "./subject-model.js";

export default {

    async findExamByClassID(cID) {
        let list = []
        let result = await db('ctltlh').where('MaLop', '=', cID)
        for (let idx in result){
            list.push(result[idx].MaLichThi)
        }
        return list
    },
    async findSubjectScheduleByExamID(exID){
        let results = await db('ctltmh').where('MaLichThi', '=', exID)
            .orderBy('NgayThi', 'asc')
        for (let item in results){
            let subject = await subjectModel.findSubject(results[item].MaMon)
            // console.log(subject)
            results[item].TenMon = subject[0].TenMonHoc
        }
        return results
    },
    async findLatestExamSchedule(){
        let list = await db("lichthi").orderBy('NamHoc', "desc")
            .orderBy('HocKy', "desc")
        if (list.length === 0){
            return null
        }
        return list[0]
    },
    addExamSchedule(entity) {
        return db('lichthi').insert(entity)
    },
    getExamSchedule(limit, offset) {
        return db.select('*').from('lichthi').limit(limit).offset(offset)
    },
    async countExamSchedule() {
        const result = await db('lichthi').count('*')
        return result[0]['count(*)']
    },
    findScheduleByID(id) {
        return db.select('*').from('lichthi').where('MaLichThi', '=', id)
    },
    updateScheduleByID(id, entity) {
        return db('lichthi').where('MaLichThi', '=', id).update(entity)
    },
    deleteSchedule(id) {
        return db('lichthi').where('MaLichThi', '=', id).del()
    },
    addDetailExamSchedule(entity) {
        return db('ctltmh').insert(entity)
    },
    getDetailExamSchedule(id, limit, offset) {
        return db('ctltmh').join('monhoc', 'ctltmh.MaMon', '=', 'monhoc.MaMon').where('MaLichThi', '=', id).select('*').limit(limit).offset(offset)
    },
    async countDetailExamSchedule(id) {
        const result = await db('ctltmh').where('MaLichThi', '=', id).count('*')
        return result[0]['count(*)']
    },
    deleteDetailSchedule(id, subjectId) {
        return db('ctltmh').where('MaLichThi', '=', id).where('MaMon', '=', subjectId).del()
    },
    getAllSubjectIDInSchedule(id) {
        return db.select('MaMon').from('ctltmh').where('MaLichThi', '=', id).pluck('MaMon')
    },
    findDetailScheduleByID(id, sId) {
        return db('ctltmh').join('monhoc', 'ctltmh.MaMon', '=', 'monhoc.MaMon').where('MaLichThi', '=', id).where('ctltmh.MaMon', '=', sId).select('*')
    },
    updateDetailScheduleByID(id, sId, entity) {
        return db('ctltmh').where('MaLichThi', '=', id).where('MaMon', '=', sId).update(entity)
    },
    getScheduleInClass(id) {
        return db('ctltlh').join('lichthi', 'lichthi.MaLichThi', '=', 'ctltlh.MaLichThi').where('MaLop', '=', id).select('*')
    },
    getAllExamScheduleForClass(year, array) {
        return db.select('*').from('lichthi').where('NamHoc', '=', year).whereNotIn('HocKy', array)
    },
    addExamScheduleInClass(entity) {
        return db('ctltlh').insert(entity)
    },
    deleteScheduleInClass(id, cId) {
        return db('ctltlh').where('MaLichThi', '=', id).where('MaLop', '=', cId).del()
    }
}