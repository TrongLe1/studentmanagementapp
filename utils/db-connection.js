import knex from "knex"

const db =knex({
    client: 'mysql2',
    connection: {
        host : '127.0.0.1',
        port: 3306,
        user : 'root',
        password : '',
        database : 'std_management_app'
    },
    pool: {
        max: 10,
        min: 0
    }

});

export default db
