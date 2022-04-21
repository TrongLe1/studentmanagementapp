import knex from "knex"

export const connectionInfo = {
    host : '127.0.0.1',
    port: 3306,
    user : 'root',
    password : '',
    database : 'std_management_app'
}

const db = knex({
    client: 'mysql2',
    connection: connectionInfo,
    pool: {
        max: 10,
        min: 0
    }
});

export default db
