import knex from "knex"

const db =knex({
    client: 'mysql',
    connection: {
        host : HOST_NAME,
        port: PORT,
        user : DATABASE_USERNAME,
        password : DATABASE_PASSWORD,
        database : DATABASE_NAME
    },
    pool: {
        max: MAX_POOL,
        min: MIN_POOL
    }
});


export default db
