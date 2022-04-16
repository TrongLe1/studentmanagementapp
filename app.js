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
import cheerio from "cheerio";
import studentModel from "./models/student-model.js";
import classModel from "./models/class-model.js";


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
            return new Intl.DateTimeFormat('vi-VN').format(new Date(val))
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
        timeTableCheck(val){
            // console.log(val)
            let result = ""
            let ngay = 2;
            let idx = 0;
            while (ngay <= 8){
                if(val[idx] != null && ngay === val[idx].NgayHoc){
                    result += '<td>\n'
                    result+= '<span className="bg-sky padding-5px-tb padding-15px-lr border-radius-5 margin-10px-bottom    font-size16 xs-font-size13">'
                    result+= val[idx].TenMonHoc
                    result+='</span>\n'
                    result+='<div className="font-size13 text-light-gray">'
                    result+= 'Ivana Wong'
                    result+='</div>\n'
                    result+='</td>\n'
                    idx++
                }
                else {
                    result += '<td></td>'
                }
                ngay += 1

            }
            return result
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

    req.session.login = false;
    req.session.account = null;

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

    let checkAccount = (await accountModel.findAccountByUsername(account.TenDangNhap))[0]
    if(bcrypt.compareSync(account.MatKhau, checkAccount.Matkhau)){

        delete checkAccount.Matkhau
        req.session.login = true
        req.session.accountAuth = checkAccount
        if (checkAccount.LoaiTaiKhoan === 2){
            req.session.student = (await studentModel.findStudentById(req.session.accountAuth.MaTaiKhoan))[0]
            req.session.class = (await classModel.findClassById(req.session.student.ThuocLop))[0]

            res.redirect('/student')
        }else if(checkAccount.LoaiTaiKhoan === 4){
            res.redirect('/admin')
        }else if(checkAccount.LoaiTaiKhoan === 1){
            res.redirect('/teacher')
        }else{
            res.redirect('/teacher')
        }
    }
    else{
        res.redirect('/login')
    }

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