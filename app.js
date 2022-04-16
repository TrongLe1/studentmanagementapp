import express from 'express'
import asyncErrors from 'express-async-errors'
import morgan from 'morgan'
import { engine } from 'express-handlebars'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import express_section from 'express-handlebars-sections'
import session from 'express-session'
import admin from './routes/admin-route.js'
import teacher from './routes/teacher-route.js'
import studentRoute from "./routes/student-route.js"
import accountModel from "./models/account-model.js"
import bcrypt from 'bcryptjs'


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
        },
        formatDate(val){
            return val.toLocaleString('vi').split(" ")[1]
        },
        checkGender(val){
            if(val === 1){
                return "Nam"
            }else
                return "Nữ"
        },
        formatMoney(val) {
            return val.toLocaleString({style: 'currency', currency: 'VND'}) + " VND";
        },
        checkTimeSession(val){
            let s = val.split(':')[0]
            return s < 13 ? "Sáng": "Chiều"
        },
        format_status(val) {
            if (val === 1) return "Hoạt động"
            else return "Đã khóa"
        },
        format_type(val) {
            if (val === 1) return "Giáo viên"
            else if (val === 2) return "Học sinh"
            else if (val === 3) return "Giáo vụ"
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
    cookie: {

    }
}))

app.use('/admin', admin)
app.use('/', studentRoute)
app.use('/teacher', teacher)

app.get('/logout', function (req, res) {
    res.redirect('login')
})

app.get('/login', function (req, res) {
    res.render('login', {
        layout: "index.hbs"
    })
})

app.post('/login', async function (req, res) {
    // console.log("Start Login")
    let account = req.body
    if (account.TenDangNhap === ''){
        res.redirect('/login')
        return;
    }
    let checkAccount = await accountModel.findAccountByUsername(account.TenDangNhap)
    if (checkAccount[0].LoaiTaiKhoan === 2){
        res.redirect('/student')
    }else
    res.redirect('/login')
})


app.get('/forgot-password', function (req, res) {
    res.render('forgetpw', {
        layout: "index.hbs"
    })
})

app.post('/forgot-password', function (req, res) {
    res.redirect('/forgot-password')
})

const port = 3000
app.listen(port, () => {
    // console.log(`Example app listening at http://localhost:${port}` + `/teacher`)
    console.log(`Example app listening at http://localhost:${port}/login`)
})