import express from "express";
import bcrypt from 'bcryptjs'
import accountModel from "../models/account-model.js";
import studentModel from "../models/student-model.js";
import classModel from "../models/class-model.js";
import teacherModel from "../models/teacher-model.js";

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/login')
})

router.get('/logout', function (req, res) {
    req.session.login = false;
    req.session.accountAuth = null;
    res.redirect('login')
})

router.get('/login', function (req, res) {
    res.render('login', {
        layout: "index.hbs"
    })
})

router.post('/login', async function (req, res) {
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
            req.locals.isTeacher = true
            req.session.teacher = (await teacherModel.findTeacherAccount(req.session.accountAuth.MaTaiKhoan))[0]
            res.redirect('/teacher')
        } else {
            res.locals.isHomeroomTeacher = true
            req.session.homeroomTeacher = (await teacherModel.findTeacherAccount(req.session.accountAuth.MaTaiKhoan))[0]
            req.session.homeroomClass = (await classModel.findHomeroomClass(req.session.homeroomTeacher.ChuNhiemLop))[0]
            res.redirect('/teacher')
        }
    } else {
        res.redirect('/login')
    }
})

router.get('/forgot-password', function (req, res) {
    res.render('forgetpw', {
        layout: "index.hbs"
    })
})

router.post('/forgot-password', function (req, res) {
    res.redirect('/forgot-password')
})

export default router