import express from 'express'
import asyncErrors from 'express-async-errors'
import morgan from 'morgan'
import { engine } from 'express-handlebars'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import express_section from 'express-handlebars-sections'
import session from 'express-session'
import admin from './routes/admin-route.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: true
}))
app.engine('hbs', engine({
    helpers: {
        section: express_section()
    }
}))
app.set('view engine', 'hbs')
app.set('views', './views')
app.use('/public', express.static('public'))
app.set('trust proxy', 1)
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))

app.use('/admin', admin)

const port = 3000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})