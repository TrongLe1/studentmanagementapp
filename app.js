import express from 'express'
import viewMdw from './middlewares/views.mdw.js'
import localMdw from './middlewares/locals.mdw.js'
import routeMdw from './middlewares/routes.mdw.js'
import sessionMdw from './middlewares/session.mdw.js'
import {dirname} from 'path'
import {fileURLToPath} from 'url'
import morgan from 'morgan'
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
app.use('/public', express.static('public'))
sessionMdw(app)
localMdw(app)
viewMdw(app)

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

routeMdw(app)


const port = 3000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}/login`)
})