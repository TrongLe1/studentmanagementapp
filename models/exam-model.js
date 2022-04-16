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
    }

}