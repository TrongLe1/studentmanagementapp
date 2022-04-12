import express from 'express'
import asyncErrors from 'express-async-errors'
import morgan from 'morgan'
import { engine } from 'express-handlebars'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import express_section from 'express-handlebars-sections'
import session from 'express-session'
import admin from './routes/admin-route.js'
import router from "./routes/admin-route.js";

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: true
}))

app.engine('hbs', engine({
    helpers: {
        section: express_section(),
        format_date(val) {
            const date = val.getDate()
            const month = val.getMonth() + 1
            return [
                date.toString().padStart(2, '0'),
                month.toString().padStart(2, '0'),
                val.getFullYear()
            ].join('/')
        },
        format_gender(val) {
            if (val === 0) return 'Nam'
            else return 'Nữ'
        }
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

app.get('/login', function (req, res) {
    res.render('login', {
        layout: "index.hbs"
    })
})

app.get('/forgot-password', function (req, res) {
    res.render('forgetpw', {
        layout: "index.hbs"
    })
})

const port = 3000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})