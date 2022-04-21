import express from 'express'
import asyncErrors from 'express-async-errors'
import morgan from 'morgan'
import {engine} from 'express-handlebars'
import {dirname} from 'path'
import {fileURLToPath} from 'url'
import express_section from 'express-handlebars-sections'
import session from 'express-session'
import admin from './routes/admin-route.js'
import teacher from './routes/teacher-route.js'
import studentRoute from "./routes/student-route.js"
import accountModel from "./models/account-model.js"
import bcrypt from 'bcryptjs'
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
            if (val === 1) return 'Nam'
            else return 'Nữ'
        },
        formatDate(val) {
            return new Intl.DateTimeFormat('vi-VN').format(new Date(val))
        },
        checkGender(val) {
            if (val === 1) {
                return "Nam"
            } else
                return "Nữ"
        },
        formatMoney(val) {
            return val.toLocaleString({style: 'currency', currency: 'VNĐ'}) + " VNĐ";
        },
        checkTimeSession(val) {
            let s = val.split(':')[0]
            return s < 13 ? "Sáng" : "Chiều"
        },
        timeTableCheck(val) {
            // console.log(val)
            let result = ""
            let ngay = 2;
            let idx = 0;
            while (ngay <= 8) {
                if (val[idx] != null && ngay === val[idx].NgayHoc) {
                    result += '<td>\n'
                    result += '<span class="bg-sky padding-5px-tb padding-15px-lr border-radius-5 margin-10px-bottom    font-size16 xs-font-size13">'
                    result += val[idx].TenMonHoc
                    result += '</span>\n'
                    // result += '<div class="font-size13 text-light-gray">'
                    // result += 'Ivana Wong'
                    // result += '</div>\n'
                    result += '</td>\n'
                    idx++
                } else {
                    result += '<td></td>'
                }
                ngay += 1
            }
            return result
        },
        format_status(val) {
            if (val === 1) return "Hoạt động"
            else return "Đã khóa"
        },
        format_type(val) {
            if (val === 1) return "Giáo viên"
            else if (val === 2) return "Học sinh"
            else if (val === 3) return "Giáo viên chủ nhiệm"
            else if (val === 4) return "Giáo vụ"
        },
        formatScores: function (val) {
            // console.log(val)
            let result = ""
            let hs1 = 0;
            let hs2 = 0;
            let hs3 = 0;
            let idx = 0, times = 0, sum=0,tongheso=0;
            while(times < 7){
                if(hs1 < 4){
                    if(val[idx].HeSoDiem === 1){
                        result+= `<td class="text-center">${val[idx].SoDiem}</td>`
                        sum+= val[idx].SoDiem

                        idx++
                        tongheso++
                    }else{
                        result+= `<td class="text-center"></td>`
                    }
                    hs1++
                }else if(hs2 < 2){
                    if(val[idx].HeSoDiem === 2){
                        result+= `<td class="text-center">${val[idx].SoDiem}</td>`
                        sum+= val[idx].SoDiem * 2
                        idx++
                        tongheso+=2
                    }else{
                        result+= `<td class="text-center"></td>`
                    }
                    hs2++
                }else{
                    if(val[idx].HeSoDiem === 3){
                        result+= `<td class="text-center">${val[idx].SoDiem}</td>`
                        sum+= val[idx].SoDiem * 3
                        idx++
                        tongheso+=3
                    }else{
                        result+= `<td class="text-center"></td>`
                    }
                    hs3++
                }
                // console.log(sum)
                times++;
            }


            let value = (sum/tongheso).toFixed(2)
            if (hs1 !== 0 && hs2 !==0  && hs3 !== 0) {
                result += `<td class="text-center">${value}</td>`
                // Tinh Diem
            } else {
                result += '<td class="text-center"></td>'
            }
            // console.log(val)
            return result
        },
        plusIdx(val) {
            return val++
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

function authAdmin(req, res, next) {
    if (req.session.login === false || typeof (req.session.login) === 'undefined') {
        req.session.retUrl = req.originalUrl
        return res.redirect('/login')
    }
    else if (req.session.accountAuth.LoaiTaiKhoan === 4)
        next()
    else if (req.session.accountAuth.LoaiTaiKhoan === 2)
        return res.redirect('/')
    else
        return res.redirect('/teacher')
}


app.use('/admin', authAdmin, admin)
app.use('/', studentRoute)
app.use('/teacher', teacher)

app.get('/logout', function (req, res) {

    req.session.login = false;
    req.session.accountAuth = null;

    res.redirect('login')
})

app.get('/login', function (req, res) {
    res.render('login', {
        layout: "index.hbs"
    })
})

app.post('/login', async function (req, res) {
    let account = req.body
    if (account.TenDangNhap === '') {
        res.redirect('/login')
        return;
    }

    let checkAccount = (await accountModel.findAccountByUsername(account.TenDangNhap))[0]
    if (bcrypt.compareSync(account.MatKhau, checkAccount.Matkhau)) {

        delete checkAccount.Matkhau
        req.session.login = true
        req.session.accountAuth = checkAccount
        if (checkAccount.LoaiTaiKhoan === 2) {
            req.session.student = (await studentModel.findStudentById(req.session.accountAuth.MaTaiKhoan))[0]
            req.session.class = (await classModel.findClassById(req.session.student.ThuocLop))[0]
            res.redirect('/student')
        } else if (checkAccount.LoaiTaiKhoan === 4) {
            res.redirect('/admin')
        } else if (checkAccount.LoaiTaiKhoan === 1) {
            res.redirect('/teacher')
        } else {
            res.redirect('/teacher')
        }
    } else {
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
    console.log(`Example app listening at http://localhost:${port}/login`)
})