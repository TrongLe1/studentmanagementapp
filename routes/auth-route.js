import express from "express";
import bcrypt from 'bcryptjs'
import accountModel from "../models/account-model.js";
import studentModel from "../models/student-model.js";
import classModel from "../models/class-model.js";
import teacherModel from "../models/teacher-model.js";

const router = express.Router();

router.get('/', function (req, res) {
   if (req.session.login) {
       let role = req.session.accountAuth.LoaiTaiKhoan
       switch (role) {
           case 1: case 3:
               return res.redirect('/teacher')
               break
           case 2:
               return res.redirect('/student')
               break
           case 4:
               return res.redirect('admin')
               break
       }
   } else {
       res.redirect('/login')
   }
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
    if (account.TenDangNhap === '' || account.MatKhau === '')
        return res.redirect('/login')
    let checkAccount = ''
    let result = (await accountModel.findAccountByUsername(account.TenDangNhap))
    console.log(result)
    if (result.length !== 0) {
        checkAccount = result[0]
    } else
        return res.redirect('/login')
    if (bcrypt.compareSync(account.MatKhau, checkAccount.Matkhau)) {
        delete checkAccount.Matkhau
        req.session.login = true
        req.session.accountAuth = checkAccount
        console.log(checkAccount)
        if (checkAccount.LoaiTaiKhoan === 2) {
            req.session.student = (await studentModel.findStudentById(req.session.accountAuth.MaTaiKhoan))[0]
            req.session.class = (await classModel.findClassById(req.session.student.ThuocLop))[0]
            res.redirect('/student')
        } else if (checkAccount.LoaiTaiKhoan === 4) {
            res.redirect('/admin')
        } else if (checkAccount.LoaiTaiKhoan === 1) {
            req.session.isHomeroomTeacher = false
            req.session.teacher = (await teacherModel.findTeacherAccount(req.session.accountAuth.MaTaiKhoan))[0]
            res.redirect('/teacher')
        } else if (checkAccount.LoaiTaiKhoan === 3) {
            req.session.isHomeroomTeacher = true
            req.session.teacher = (await teacherModel.findTeacherAccount(req.session.accountAuth.MaTaiKhoan))[0]
            req.session.homeroomClass = (await classModel.findHomeroomClass(req.session.teacher.ChuNhiemLop))[0]
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