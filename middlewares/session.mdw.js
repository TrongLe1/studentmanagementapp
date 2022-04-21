import session from 'express-session'
import fnMySQLStore from 'express-mysql-session'
import { connectionInfo } from '../utils/db-connection.js'

export default function (app) {
    const MySQLStore = fnMySQLStore(session);
    const sessionStore = new MySQLStore(connectionInfo);

    app.set('trust proxy', 1)
    app.use(session({
        secret: 'secret_key',
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
        cookie: {}
    }))
}