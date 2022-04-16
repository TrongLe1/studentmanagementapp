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
    }

}