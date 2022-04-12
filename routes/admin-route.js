import express from 'express'
import bcrypt from 'bcryptjs'
import teacherModel from '../models/teacher-model.js'
import accountModel from '../models/account-model.js'

const router = express.Router();

router.get('/', function (req, res) {
    res.render('admin/dashboard', {
        layout: "admin.hbs",
        dashboard: true
    })
})

router.get('/teacher', async function (req, res) {
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await teacherModel.getTeacher(limit, offset)
    const total = await teacherModel.countTeacher()
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)};
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page};
    let prevPage = {check: true, value: (+page - 1)};
    if (nexPage.value === nPage + 1) nexPage.check = false;
    if (prevPage.value === 0) prevPage.check = false;
    if (total === 0) curPage.check = false;
    res.render('admin/teacher-list', {
        layout: "admin.hbs",
        teacher: true,
        result,
        nexPage,
        curPage,
        prevPage
    })
})

router.get('/teacher/add', function (req, res) {
    res.render('admin/teacher-add', {
        layout: "admin.hbs",
        teacher: true
    })
})

router.post('/teacher/add', async function (req, res) {
    const dateParts = req.body.date.split('/')
    const date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    const teacher = {
        HoTen: req.body.name,
        NgaySinh: date,
        GioiTinh: req.body.gender,
    }
    await teacherModel.addTeacher(teacher)
    res.render('admin/teacher-add', {
        layout: "admin.hbs",
        teacher: true,
        added: true,
    })
})

router.get('/teacher/edit', async function (req, res) {
    const result = await teacherModel.findTeacherById(req.query.id)
    for (const item of result) {
        if (item.GioiTinh === 0) item.Nam = true
        else item.Nu = true
    }
    res.render('admin/teacher-edit', {
        layout: "admin.hbs",
        teacher: true,
        result: result[0]
    })
})

router.post('/teacher/edit', async function (req, res) {
    const dateParts = req.body.date.split('/')
    const date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    const teacher = {
        HoTen: req.body.name,
        NgaySinh: date,
        GioiTinh: req.body.gender,
    }
    await teacherModel.updateTeacher(teacher, req.body.id)
    const result = await teacherModel.findTeacherById(req.body.id)
    for (const item of result) {
        if (item.GioiTinh === 0) item.Nam = true
        else item.Nu = true
    }
    res.render('admin/teacher-edit', {
        layout: "admin.hbs",
        teacher: true,
        edited: true,
        result: result[0]
    })
})

router.post('/teacher/delete', async function (req, res) {
    await teacherModel.deleteTeacher(req.body.id)
    res.redirect(req.headers.referer || '/admin/teacher')
})

router.post('/teacher/createaccount', async function (req, res) {
    const result = await teacherModel.findTeacherById(req.body.id)
    const date = result[0].NgaySinh.getDate()
    const month = result[0].NgaySinh.getMonth() + 1
    const password = [
        date.toString().padStart(2, '0'),
        month.toString().padStart(2, '0'),
        result[0].NgaySinh.getFullYear()
    ].join('')
    for (const item of result) {
        item.HoTen = item.HoTen.toLowerCase()
        item.HoTen = item.HoTen.replace(/ /g,'')
        item.HoTen = item.HoTen.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        item.HoTen = item.HoTen.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        item.HoTen = item.HoTen.replace(/ì|í|ị|ỉ|ĩ/g, "i")
        item.HoTen = item.HoTen.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        item.HoTen = item.HoTen.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        item.HoTen = item.HoTen.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        item.HoTen = item.HoTen.replace(/đ/g, "d")
        item.HoTen = item.HoTen.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "")
        item.HoTen = item.HoTen.replace(/\u02C6|\u0306|\u031B/g, "")
    }
    const check = await accountModel.findAccountByUsername(result[0].HoTen)
    if (check.length === 0) {
        const salt = bcrypt.genSaltSync(10)
        const account = {
            TenDangNhap: result[0].HoTen,
            Matkhau: bcrypt.hashSync(password, salt),
            LoaiTaiKhoan: 1
        }
        const id = await accountModel.createTeacherAccount(account)
        await teacherModel.createAccount(id[0], result[0].MaGV)
    }
    res.redirect(req.headers.referer || '/admin/teacher')
})

export default router