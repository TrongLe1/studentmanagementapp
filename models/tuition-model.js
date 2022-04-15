import db from '../utils/db-connection.js'

export default {

    findTuitionByClassID(cID) {
        return db('hocphi').where('MaLop', '=', cID)
    },
    async findListHocKyAndNamHoc(cID){
        return db('hocphi').select('HocKy', 'NamHoc').groupBy('HocKy','NamHoc')
            .where('MaLop', '=', cID)
            .orderBy('NamHoc', 'desc')
            .orderBy('HocKy','desc')
    },
    findTuiTionBySpecificHKNHAndClassID(cID, hk, nh) {
        return db('hocphi').whereRaw(`MaLop = ${cID} and HocKy = ${hk} and NamHoc = ${nh}`)
    },


}