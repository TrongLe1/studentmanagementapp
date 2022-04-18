import db from '../utils/db-connection.js'
import parentModel from "./parent-model.js";


export default {
    findRelative(mahs) {
        return db('ctphuhuynh').where('MaHocSinh', '=', mahs)
    },
    async findInfoRelative(mahs){
        let list = await this.findRelative(mahs);
        for (let item in list){
            let info = await parentModel.findParentsById(list[item].MaPHHS)
            // console.log(info[0])
            list[item].info = info[0]
        }
        return list
    },
    findInfoRelativeDetailt(parentID){
        return db('phuhuynh').where('MaPHHS','=',parentID)
    },
    updateRelativeDetail(entity, id){
        return db('phuhuynh').where('MaPHHS').update(entity)
    }
}