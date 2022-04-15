import db from '../utils/db-connection.js'

export default {

    findParentsById(maphhs) {
        return db('phuhuynh').where('MaPHHS', '=', maphhs)
    }

}