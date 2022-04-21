import db from '../utils/db-connection.js'
import subjectModel from "./subject-model.js";

export default {

    async findLatestTimeTableSchedule(){
        let list = await db("thoikhoabieu").select('HocKy','NamHoc').orderBy('NamHoc', "desc")
            .orderBy('HocKy', "desc")
        if (list.length === 0){
            return null
        }
        return list[0]
    },
    async findLatestTimeTableScheduleOfClass(classID){
        let list = await db("thoikhoabieu").orderBy('NamHoc', "desc")
            .orderBy('HocKy', "desc").where('MaLop','=', classID)
        if (list.length === 0){
            return null
        }
        return list[0]
    },
    findTimeTableOfClassByTimetableID(tid){
        return db('cttkb').where('MaTKB','=', tid)
    },
    findTimeTableOfClassByTimetableIDAndDay(tid, day, check){
        return check === true ? db('cttkb').where('MaTKB','=', tid)
            .andWhere('NgayHoc', '=',day)
            .andWhere('ThoiGianBD', '<', '12:00:00')
            .orderBy('ThoiGianBD', "asc")
            : db('cttkb').where('MaTKB','=', tid)
            .andWhere('NgayHoc', '=',day)
            .andWhere('ThoiGianBD', '>=', '12:00:00')
            .orderBy('ThoiGianBD', "asc")
    },
    async findTimeTableOfClassByTimetableIDAndTime(tid, time){
        let timetableList = await db('cttkb').where('MaTKB','=', tid)
                .andWhere('ThoiGianBD', '=', time)
                .orderBy('NgayHoc', "asc")
        // if (timetableList)
        for (let idx in timetableList){
            let monhoc = await subjectModel.findSubject(timetableList[idx].MaMon)
            timetableList[idx].TenMonHoc = monhoc[0].TenMonHoc
        }
        // console.log(timetableList)
        return timetableList
    },
    findTimetableInClass(id) {
        return db.select('*').from('thoikhoabieu').where('MaLop', '=', id)
    },
    addTimetable(entity) {
        return db('thoikhoabieu').insert(entity)
    },
    findSemesterTimetableInClass(id, semester) {
        return db.select('*').from('thoikhoabieu').where('MaLop', '=', id).where('HocKy', '=', semester)
    },
    deleteTimetable(id) {
        return db('thoikhoabieu').where('MaTKB', '=', id).del()
    },
    addDetailTimetable(entity) {
        return db('cttkb').insert(entity)
    },
    getDetailTimetableByTime(time) {
        return db("cttkb").select('*').join('monhoc', 'monhoc.MaMon', 'cttkb.MaMon').where('ThoiGianBD', '=', time).orderBy('NgayHoc', "asc")
    },
    findDetailTimetableExist(id, time, day) {
        return db("cttkb").select('*').where('ThoiGianBD', '=', time).where('MaTKB', '=', id).where('NgayHoc', '=', day)
    },
    updateDetailTimetable(id, time, day, subject) {
        return db('cttkb').where('MaTKB', '=', id).where('ThoiGianBD', '=', time).where('NgayHoc', '=', day).update({MaMon: subject})
    },
    deleteDetailTimeTable(id, time, day) {
        return db('cttkb').where('MaTKB', '=', id).where('ThoiGianBD', '=', time).where('NgayHoc', '=', day).del()
    },
    deleteAllDetailTimetable(id) {
        return db('cttkb').where('MaTKB', '=', id).del()
    },
    async removeTimetableFromClass(id) {
        const result = await db.select('MaTKB').from('thoikhoabieu').where('MaLop', '=', id)
        for (const item of result)
            await db('cttkb').where('MaTKB', '=', item.MaTKB).del()
        return db('thoikhoabieu').where('MaLop', '=', id).del()
    }
}