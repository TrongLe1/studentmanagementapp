import db from '../utils/db-connection.js'

export default {
    getSubject(limit, offset) {
        return db.select('*').from('monhoc').limit(limit).offset(offset)
    },
    async countSubject() {
        const result = await db('monhoc').count('*')
        return result[0]['count(*)']
    },
    addSubject(entity) {
        return db('monhoc').insert(entity)
    },
    deleteSubject(id) {
        return db('monhoc').where('MaMon', '=', id).del()
    },
    findSubject(id){
        return db('monhoc').where('MaMon', '=', id)
    }
}