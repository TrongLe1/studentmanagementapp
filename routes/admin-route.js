import express from 'express'
import bcrypt from 'bcryptjs'
import teacherModel from '../models/teacher-model.js'
import accountModel from '../models/account-model.js'
import classModel from '../models/class-model.js'
import subjectModel from '../models/subject-model.js'
import studentModel from '../models/student-model.js'
import examModel from '../models/exam-model.js'
import timetableModel from '../models/timetable-model.js'

const router = express.Router();

router.get('/', async function (req, res) {

    const classNum = await classModel.countClass()
    const subjectNum = await subjectModel.countSubject()
    const stuNum = await studentModel.countStudent()
    const teacNum = await teacherModel.countTeacher()
    res.render('admin/dashboard', {
        layout: "admin.hbs",
        dashboard: true,
        classNum,
        subjectNum,
        stuNum,
        teacNum
    })
})

//Giao Vien
router.get('/teacher', async function (req, res) {
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    let result
    let total
    if (req.query.keyword) {
        result = await teacherModel.searchTeacherByName(req.query.keyword, limit, offset)
        total = await teacherModel.countSearchTeacher(req.query.keyword)
    }
    else {
        result = await teacherModel.getTeacher(limit, offset)
        total = await teacherModel.countTeacher()
    }
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('admin/teacher-list', {
        layout: "admin.hbs",
        teacher: true,
        result,
        nexPage,
        curPage,
        prevPage,
        keyword: req.query.keyword
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
    const id = await teacherModel.addTeacher(teacher)
    const result = await teacherModel.findTeacherById(id[0])
    const datePass = result[0].NgaySinh.getDate()
    const month = result[0].NgaySinh.getMonth() + 1
    const password = [
        datePass.toString().padStart(2, '0'),
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
    //const check = await accountModel.findAccountByUsername(result[0].HoTen)
    //if (check.length === 0) {
        const salt = bcrypt.genSaltSync(10)
        const account = {
            TenDangNhap: result[0].HoTen,
            Matkhau: bcrypt.hashSync(password, salt),
            LoaiTaiKhoan: 1
        }
        const accId = await accountModel.createAccount(account)
        await teacherModel.createAccount(accId[0], result[0].MaGV)
    //}
    res.render('admin/teacher-add', {
        layout: "admin.hbs",
        teacher: true,
        added: true,
    })
})

/*
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
    console.log(result)
    if (result[0].TaiKhoan !== null) {
        const date = result[0].NgaySinh.getDate()
        const month = result[0].NgaySinh.getMonth() + 1
        const password = [
            date.toString().padStart(2, '0'),
            month.toString().padStart(2, '0'),
            result[0].NgaySinh.getFullYear()
        ].join('')
        const salt = bcrypt.genSaltSync(10)
        const account = {
            TenDangNhap: req.body.name,
            MatKhau: bcrypt.hashSync(password, salt)
        }
        account.TenDangNhap = account.TenDangNhap.toLowerCase()
        account.TenDangNhap = account.TenDangNhap.replace(/ /g, '')
        account.TenDangNhap = account.TenDangNhap.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        account.TenDangNhap = account.TenDangNhap.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        account.TenDangNhap = account.TenDangNhap.replace(/ì|í|ị|ỉ|ĩ/g, "i")
        account.TenDangNhap = account.TenDangNhap.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        account.TenDangNhap = account.TenDangNhap.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        account.TenDangNhap = account.TenDangNhap.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        account.TenDangNhap = account.TenDangNhap.replace(/đ/g, "d")
        account.TenDangNhap = account.TenDangNhap.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "")
        account.TenDangNhap = account.TenDangNhap.replace(/\u02C6|\u0306|\u031B/g, "")
        await accountModel.updateAccountById(result[0].TaiKhoan, account)
    }
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

router.post('/teacher/createaccount', async function (req, res) {
    const result = await teacherModel.findTeacherById(req.body.id)
    const date = result[0].NgaySinh.getDate()
    const month = result[0].NgaySinh.getMonth() + 1
    const password = [
        date.toString().padStart(2, '0'),
        month.toString().padStart(2, '0'),
        result[0].NgaySinh.getFullYear()
    ].join('')
    console.log(password)
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
        const id = await accountModel.createAccount(account)
        await teacherModel.createAccount(id[0], result[0].MaGV)
    }
    res.redirect(req.headers.referer || '/admin/teacher')
})
*/
router.post('/teacher/delete', async function (req, res) {
    const result = await teacherModel.findTeacherById(req.body.id)
    console.log(result)
    await teacherModel.deleteTeacher(req.body.id)
    await accountModel.deleteAccount(result[0].TaiKhoan)
    res.redirect(req.headers.referer || '/admin/teacher')
})

//Lop Hoc
router.get('/class', async function (req, res) {
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    let result
    const year = await classModel.getClassYear()
    let total
    if (req.query.year) {
        result = await classModel.getClassByYear(limit, offset, req.query.year)
        total = await classModel.countClassByYear(req.query.year)
    }
    else {
        result = await classModel.getClass(limit, offset)
        total = await classModel.countClass()
    }
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('admin/class-list', {
        layout: "admin.hbs",
        class: true,
        result,
        nexPage,
        curPage,
        prevPage,
        year
    })
})

router.get('/class/add', async function (req, res) {
    const result = await teacherModel.getNotHomeroomTeacher()
    res.render('admin/class-add', {
        layout: "admin.hbs",
        class: true,
        result
    })
})

router.post('/class/add', async function (req, res) {
    const clss = {
        TenLop: req.body.name,
        PhongHoc: req.body.room,
        NamHoc: req.body.start + ' - ' + req.body.end
    }
    const id = await classModel.addClass(clss)
    if (req.body.teacher !== '')
        await teacherModel.assignHomeroomTeacher(req.body.teacher, id)
    const result = await teacherModel.getNotHomeroomTeacher()
    res.render('admin/class-add', {
        layout: "admin.hbs",
        class: true,
        added: true,
        result
    })
})

router.get('/class/edit', async function (req, res) {
    const result = await teacherModel.getNotHomeroomTeacher()
    const clss = await classModel.findClassById(req.query.id)
    const teacher = await teacherModel.findHomeroomTeacher(req.query.id)
    for (const item of clss) {
        const temp = item.NamHoc.split(' - ')
        item.BatDau = temp[0]
        item.KetThuc = temp[1]
    }
    if (teacher.length !== 0)
        teacher[0].check = true
    req.session.retUrl = req.headers.referer
    res.render('admin/class-edit', {
        layout: "admin.hbs",
        class: true,
        result,
        teachers: teacher[0],
        clss: clss[0]
    })
})

router.post('/class/edit', async function (req, res) {
    const clss = {
        TenLop: req.body.name,
        PhongHoc: req.body.room,
        NamHoc: req.body.start + ' - ' + req.body.end
    }
    await classModel.editClass(req.body.id, clss)
    if (req.body.teacher !== '') {
        await teacherModel.removeHomeroomTeacherFromClass(req.body.id)
        await teacherModel.assignHomeroomTeacher(req.body.teacher, req.body.id)
    }
    res.redirect(req.session.retUrl || '/admin/class')
    /*
    const result = await teacherModel.getNotHomeroomTeacher()
    const teacher = await teacherModel.findHomeroomTeacher(req.body.id)
    const temp = clss.NamHoc.split(' - ')
    clss.BatDau = temp[0]
    clss.KetThuc = temp[1]
    clss.MaLop = req.body.id
    if (teacher.length !== 0)
        teacher[0].check = true
    res.render('admin/class-edit', {
        layout: "admin.hbs",
        class: true,
        added: true,
        result,
        teachers: teacher[0],
        clss
    })

     */
})

router.post('/class/delete', async function (req, res) {
    await classModel.removeTuitionFromClass(req.body.id)
    await timetableModel.removeTimetableFromClass(req.body.id)
    await studentModel.removeAllStudentFromClass(req.body.id)
    await classModel.removeAllTeacherFromClass(req.body.id)
    await teacherModel.removeHomeroomTeacherFromClass(req.body.id)
    await examModel.removeScheduleFromClass(req.body.id)
    await classModel.deleteClass(req.body.id)
    res.redirect(req.headers.referer || '/admin/class')
})

router.get('/class/student', async function (req, res) {
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const clss = await classModel.findClassById(req.query.id)
    const result = await studentModel.getStudentInClass(req.query.id, limit, offset)
    const total = await studentModel.countStudentInClass(req.query.id)
    const students = await studentModel.getStudentNotInClass()
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('admin/class-student-list', {
        layout: "admin.hbs",
        class: true,
        result,
        clss: clss[0],
        nexPage,
        curPage,
        prevPage,
        students
    })
})

router.post('/class/student/add', async function (req, res) {
    await studentModel.updateStudent({ThuocLop: req.body.id}, req.body.student)
    res.redirect(req.headers.referer || '/admin/class')
})

router.post('/class/student/delete', async function (req, res) {
    await studentModel.removeFromClass(req.body.id)
    res.redirect(req.headers.referer || '/admin/class')
})

router.get('/class/teacher', async function (req, res) {
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const clss = await classModel.findClassById(req.query.id)
    const result = await classModel.getTeacherInClass(req.query.id, limit, offset)
    const total = await classModel.countTeacherInClass(req.query.id)
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('admin/class-teacher-list', {
        layout: "admin.hbs",
        class: true,
        result,
        clss: clss[0],
        nexPage,
        curPage,
        prevPage
    })
})

router.get('/class/teacher/add', async function (req, res) {
    const clss = await classModel.findClassById(req.query.id)
    const temp = await classModel.getTeacherIDInClass(req.query.id)
    const teachers = await teacherModel.getAllTeacherWithout(temp)
    const subjects = await subjectModel.getAllSubject()
    res.render('admin/class-teacher-add', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
        teachers,
        subjects
    })
})

router.post('/class/teacher/add', async function (req, res) {
    const detail = {
        MaLop: req.body.id,
        MaGV: req.body.teacher,
        MonHoc: req.body.subject
    }
    await classModel.addDetailTeaching(detail)
    const clss = await classModel.findClassById(req.body.id)
    const temp = await classModel.getTeacherIDInClass(req.body.id)
    const teachers = await teacherModel.getAllTeacherWithout(temp)
    const subjects = await subjectModel.getAllSubject()
    res.render('admin/class-teacher-add', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
        teachers,
        subjects,
        added: true
    })
})

router.get('/class/teacher/edit', async function (req, res) {
    const teachers = await classModel.getSpecificTeacherInClass(req.query.id, req.query.uid)
    const subjects = await subjectModel.getAllSubject()
    req.session.retUrl = req.headers.referer
    res.render('admin/class-teacher-edit', {
        layout: "admin.hbs",
        class: true,
        subjects,
        teachers: teachers[0]
    })
})

router.post('/class/teacher/edit', async function (req, res) {
    await classModel.editDetailTeaching(req.body.id, req.body.uid, req.body.subject)
    res.redirect(req.session.retUrl || `/class/teacher?id=${req.body.id}`)
    /*
    const teachers = await classModel.getSpecificTeacherInClass(req.body.id, req.body.uid)
    const subjects = await subjectModel.getAllSubject()
    res.render('admin/class-teacher-edit', {
        layout: "admin.hbs",
        class: true,
        added: true,
        subjects,
        teachers: teachers[0]
    })

     */
})

router.post('/class/teacher/delete', async function (req, res) {
    await classModel.removeTeachingInClass(req.body.id, req.body.uid)
    res.redirect(req.headers.referer || '/admin/class')
})

//Hoc Phi
router.get('/class/tuition', async function (req, res) {
    const clss = await classModel.findClassById(req.query.id)
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    let result
    let total
    let check = false
    let sum = 0
    let check1 = false
    if (req.query.semester) {
        result = await classModel.getTuitionInClassSemester(req.query.id, req.query.semester, limit, offset)
        total = await classModel.countTuitionInClassSemester(req.query.id, req.query.semester)
        sum = await classModel.sumTuitionInClassSemester(req.query.id, req.query.semester)
        check = true
    }
    else {
        result = await classModel.getTuitionInClass(req.query.id, limit, offset)
        total = await classModel.countTuitionInClass(req.query.id)
        sum = await classModel.sumTuitionInClass(req.query.id)
    }
    if (req.query.semester === '1') check1 = true
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('admin/class-tuition-list', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
        result,
        nexPage,
        curPage,
        prevPage,
        check,
        check1,
        sum,
        semester: req.query.semester
    })
})

router.get('/class/tuition/add', async function (req, res) {
    const clss = await classModel.findClassById(req.query.id)
    res.render('admin/class-tuition-add', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
    })
})

router.post('/class/tuition/add', async function (req, res) {
    const clss = await classModel.findClassById(req.body.id)
    const tuition = {
        TenHocPhi: req.body.name,
        HocKy: req.body.semester,
        NamHoc: clss[0].NamHoc,
        TongTien: req.body.price,
        MaLop: clss[0].MaLop
    }
    await classModel.addTuition(tuition)
    res.render('admin/class-tuition-add', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
        added: true
    })
})

router.post('/class/tuition/delete', async function (req, res) {
    await classModel.deleteTuition(req.body.id)
    res.redirect(req.headers.referer || '/admin/class')
})

router.get('/class/tuition/edit', async function (req, res) {
    const result = await classModel.findTuitionByID(req.query.id)
    req.session.retUrl = req.headers.referer
    res.render('admin/class-tuition-edit', {
        layout: "admin.hbs",
        class: true,
        result: result[0],
    })
})


router.post('/class/tuition/edit', async function (req, res) {
    const tuition = {
        TenHocPhi: req.body.name,
        TongTien: req.body.price
    }
    await classModel.updateTuition(req.body.id, tuition)
    res.redirect(req.session.retUrl || `/admin/class/tuition?id=${req.body.id}`)
    /*
    const result = await classModel.findTuitionByID(req.body.id)
    res.render('admin/class-tuition-edit', {
        layout: "admin.hbs",
        class: true,
        result: result[0],
        added: true,
    })

     */
})
//Mon Hoc
router.get('/subject', async function (req, res) {
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await subjectModel.getSubject(limit, offset)
    const total = await subjectModel.countSubject()
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('admin/subject-list', {
        layout: "admin.hbs",
        subject: true,
        result,
        nexPage,
        curPage,
        prevPage
    })
})

router.get('/subject/add', async function (req, res) {
    res.render('admin/subject-add', {
        layout: "admin.hbs",
        subject: true,
    })
})

router.post('/subject/add', async function (req, res) {
    const subject = {
        TenMonHoc: req.body.name
    }
    await subjectModel.addSubject(subject)
    res.render('admin/subject-add', {
        layout: "admin.hbs",
        subject: true,
        added: true
    })
})

router.get('/subject/edit', async function (req, res) {
    const result = await subjectModel.findSubject(req.query.id)
    req.session.retUrl = req.headers.referer
    res.render('admin/subject-edit', {
        layout: "admin.hbs",
        subject: true,
        result: result[0]
    })
})

router.post('/subject/edit', async function (req, res) {
    const subject = {
        MaMon: req.body.id,
        TenMonHoc: req.body.name
    }
    await subjectModel.editSubject(req.body.id, req.body.name)
    res.redirect(req.session.retUrl || '/admin/subject')
    /*
    res.render('admin/subject-edit', {
        layout: "admin.hbs",
        subject: true,
        added: true,
        result: subject
    })})

     */
})
router.post('/subject/delete', async function (req, res) {
    await timetableModel.deleteSubjectFromTimetable(req.body.id)
    await examModel.deleteSubjectFromDetailSchedule(req.body.id)
    await subjectModel.deleteSubject(req.body.id)
    res.redirect(req.headers.referer || '/admin/subject')
})

//Tai Khoan
router.get('/account', async function (req, res) {
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await accountModel.getAccount(limit, offset)
    const total = await accountModel.countAccount()
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    for (const item of result)
        if (item.TrangThai === 1)
            item.active = true
    res.render('admin/account-list', {
        layout: "admin.hbs",
        account: true,
        result,
        nexPage,
        curPage,
        prevPage
    })
})

router.post('/account/lock', async function (req, res) {
    await accountModel.lockAccount(req.body.id)
    res.redirect(req.headers.referer || '/admin/account')
})

router.post('/account/unlock', async function (req, res) {
    await accountModel.unlockAccount(req.body.id)
    res.redirect(req.headers.referer || '/admin/account')
})

//Hoc Sinh
router.get('/student', async function (req, res) {
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    let result
    let total
    if (req.query.keyword) {
        result = await studentModel.searchStudentByName(req.query.keyword, limit, offset)
        total = await studentModel.countSearchStudent(req.query.keyword)
    }
    else {
        result = await studentModel.getStudent(limit, offset)
        total = await studentModel.countStudent()
    }

    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    /*
    for (const item of result)
        if (item.ThuocLop === null)
            item.add = true

    */
    res.render('admin/student-list', {
        layout: "admin.hbs",
        student: true,
        result,
        nexPage,
        curPage,
        prevPage,
        keyword: req.query.keyword
    })
})

router.get('/student/add', async function (req, res) {
    const clss = await classModel.getAllClass()
    res.render('admin/student-add', {
        layout: "admin.hbs",
        student: true,
        clss
    })
})

router.post('/student/add', async function (req, res) {
    const clss = await classModel.getAllClass()
    const dateParts = req.body.date.split('/')
    const date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    const student = {
        HoTen: req.body.name,
        NgaySinh: date,
        GioiTinh: req.body.gender,
    }
    if (req.body.class !== '')
        student.ThuocLop = req.body.class
    const id = await studentModel.addStudent(student)
    const result = await studentModel.findStudentById(id[0])
    const datePass = result[0].NgaySinh.getDate()
    const month = result[0].NgaySinh.getMonth() + 1
    const password = [
        datePass.toString().padStart(2, '0'),
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
    const salt = bcrypt.genSaltSync(10)
    const account = {
        TenDangNhap: result[0].HoTen,
        Matkhau: bcrypt.hashSync(password, salt),
        LoaiTaiKhoan: 2
    }
    const accId = await accountModel.createAccount(account)
    await studentModel.createAccount(accId[0], result[0].MaHocSinh)
    res.render('admin/student-add', {
        layout: "admin.hbs",
        student: true,
        clss,
        added: true
    })
})

router.get('/student/editclass', async function (req, res) {
    const clss = await classModel.getAllClass()
    const student = await studentModel.findStudentById(req.query.id)
    const result = await classModel.findClassById(student[0].ThuocLop)
    req.session.retUrl = req.headers.referer
    res.render('admin/student-editclass', {
        layout: "admin.hbs",
        student: true,
        clss,
        result: result[0],
        students: student[0]
    })
})

router.post('/student/editclass', async function (req, res) {
    await studentModel.updateStudent({ThuocLop: req.body.class}, req.body.id)
    res.redirect(req.session.retUrl || '/admin/student')
    /*
    const clss = await classModel.getAllClass()
    const student = await studentModel.findStudentById(req.body.id)
    const result = await classModel.findClassById(student[0].ThuocLop)
    res.render('admin/student-editclass', {
        layout: "admin.hbs",
        student: true,
        clss,
        added: true,
        result: result[0],
        students: student[0]
    })

     */
})

//Lich thi
router.get('/schedule/add', async function (req, res) {
    res.render('admin/schedule-add', {
        layout: "admin.hbs",
        schedule: true,
    })
})

router.post('/schedule/add', async function (req, res) {
    const schedule = {
        HocKy: req.body.semester,
        NamHoc: req.body.start + ' - ' + req.body.end
    }
    await examModel.addExamSchedule(schedule)
    res.render('admin/schedule-add', {
        layout: "admin.hbs",
        schedule: true,
        added: true
    })
})

router.get('/schedule', async function (req, res) {
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await examModel.getExamSchedule(limit, offset)
    const total = await examModel.countExamSchedule()
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('admin/schedule-list', {
        layout: "admin.hbs",
        schedule: true,
        result,
        nexPage,
        curPage,
        prevPage
    })
})

router.get('/schedule/edit', async function (req, res) {
    const result = await examModel.findScheduleByID(req.query.id)
    for (const item of result) {
        const temp = item.NamHoc.split(' - ')
        item.BatDau = temp[0]
        item.KetThuc = temp[1]
    }
    req.session.retUrl = req.headers.referer
    res.render('admin/schedule-edit', {
        layout: "admin.hbs",
        schedule: true,
        result: result[0]
    })
})

router.post('/schedule/edit', async function (req, res) {
    const schedule = {
        NamHoc: req.body.start + ' - ' + req.body.end
    }
    if (req.body.semester)
        schedule.HocKy = req.body.semester
    await examModel.updateScheduleByID(req.body.id, schedule)
    res.redirect(req.session.retUrl || '/admin/schedule')
    /*
    const result = await examModel.findScheduleByID(req.body.id)
    for (const item of result) {
        const temp = item.NamHoc.split(' - ')
        item.BatDau = temp[0]
        item.KetThuc = temp[1]
    }
    res.render('admin/schedule-edit', {
        layout: "admin.hbs",
        schedule: true,
        added: true,
        result: result[0]
    })
    */
})

router.post('/schedule/delete', async function (req, res) {
    await examModel.deleteDetailScheduleFromClass(req.body.id)
    await examModel.deleteSchedule(req.body.id)
    res.redirect(req.headers.referer || '/admin/schedule')
})

router.get('/schedule/detail', async function (req, res) {
    const limit = 6
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await examModel.getDetailExamSchedule(req.query.id, limit, offset)
    const total = await examModel.countDetailExamSchedule(req.query.id)
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0 ), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false

    res.render('admin/schedule-detail-list', {
        layout: "admin.hbs",
        schedule: true,
        MaLichThi: req.query.id,
        result,
        prevPage,
        curPage,
        nexPage
    })
})

router.get('/schedule/detail/add', async function (req, res) {
    const entity = await examModel.getAllSubjectIDInSchedule(req.query.id)
    const subjects = await subjectModel.getSubjectWithout(entity)
    res.render('admin/schedule-detail-add', {
        layout: "admin.hbs",
        schedule: true,
        MaLichThi: req.query.id,
        subjects
    })
})

router.post('/schedule/detail/add', async function (req, res) {
    const dateParts = req.body.date.split('/')
    const date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    const detail = {
        MaMon: req.body.subject,
        MaLichThi: req.body.id,
        NgayThi: date,
        ThoiGianBD: req.body.start,
        ThoiGianKt: req.body.end,
        PhongThi: req.body.room
    }
    await examModel.addDetailExamSchedule(detail)
    const entity = await examModel.getAllSubjectIDInSchedule(req.body.id)
    const subjects = await subjectModel.getSubjectWithout(entity)
    res.render('admin/schedule-detail-add', {
        layout: "admin.hbs",
        schedule: true,
        MaLichThi: req.query.id,
        subjects,
        added: true
    })
})

router.get('/schedule/detail/edit', async function (req, res) {
    const entity = await examModel.getAllSubjectIDInSchedule(req.query.id)
    const subjects = await subjectModel.getSubjectWithout(entity)
    const result = await examModel.findDetailScheduleByID(req.query.id, req.query.sId)
    req.session.retUrl = req.headers.referer
    res.render('admin/schedule-detail-edit', {
        layout: "admin.hbs",
        schedule: true,
        MaLichThi: req.query.id,
        subjects,
        result: result[0]
    })
})

router.post('/schedule/detail/edit', async function (req, res) {
    const dateParts = req.body.date.split('/')
    const date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    const schedule = {
        MaMon: req.body.subject,
        NgayThi: date,
        ThoiGianBD: req.body.start,
        ThoiGianKt: req.body.end,
        PhongThi: req.body.room
    }
    await examModel.updateDetailScheduleByID(req.body.id, req.body.sId, schedule)
    res.redirect(req.session.retUrl || `/admin/schedule/detail?id=${req.body.id}`)
    /*
    const entity = await examModel.getAllSubjectIDInSchedule(req.body.id)
    const subjects = await subjectModel.getSubjectWithout(entity)
    const result = await examModel.findDetailScheduleByID(req.body.id, req.body.subject)
    res.render('admin/schedule-detail-edit', {
        layout: "admin.hbs",
        schedule: true,
        MaLichThi: req.query.id,
        subjects,
        result: result[0],
        added: true
    })
    */
})

router.post('/schedule/detail/delete', async function (req, res) {
    await examModel.deleteDetailSchedule(req.body.id, req.body.sId)
    res.redirect(req.headers.referer || '/admin/schedule')
})

//Lop Hoc Lich Thi

router.get('/class/schedule', async function (req, res) {
    const clss = await classModel.findClassById(req.query.id)
    const result = await examModel.getScheduleInClass(req.query.id)
    res.render('admin/class-schedule-list', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
        result
    })
})

router.get('/class/schedule/add', async function (req, res) {
    const clss = await classModel.findClassById(req.query.id)
    const temp = await examModel.getScheduleInClass(req.query.id)
    const semester = []
    for (const item of temp)
        semester.push(item.HocKy)
    const schedules = await examModel.getAllExamScheduleForClass(clss[0].NamHoc, semester)
    res.render('admin/class-schedule-add', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
        schedules
    })
})

router.post('/class/schedule/add', async function (req, res) {
    const detail = {
        MaLop: req.body.id,
        MaLichThi: req.body.schedule
    }
    await examModel.addExamScheduleInClass(detail)


    const clss = await classModel.findClassById(req.body.id)
    const temp = await examModel.getScheduleInClass(req.body.id)
    const semester = []
    for (const item of temp)
        semester.push(item.HocKy)
    const schedules = await examModel.getAllExamScheduleForClass(clss[0].NamHoc, semester)
    res.render('admin/class-schedule-add', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
        schedules,
        added: true
    })
})

router.post('/class/schedule/delete', async function (req, res) {
    await examModel.deleteScheduleInClass(req.body.id, req.body.cId)
    res.redirect(req.headers.referer || `/admin/class/schedule?id=${req.body.cId}`)
})

//Lop Hoc Thoi Khoa Bieu
router.get('/class/timetable', async function (req, res) {
    const clss = await classModel.findClassById(req.query.id)
    const result = await timetableModel.findTimetableInClass(req.query.id)
    res.render('admin/class-timetable-list', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
        result
    })
})

router.get('/class/timetable/add', async function (req, res) {
    const clss = await classModel.findClassById(req.query.id)
    const semester = []
    for (let i = 1; i <= 2; i++) {
        const temp = await timetableModel.findSemesterTimetableInClass(req.query.id, i)
        if (temp.length === 0)
            semester.push({HocKy: i})
    }
    res.render('admin/class-timetable-add', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
        semester
    })
})

router.post('/class/timetable/add', async function (req, res) {
    const timetable = {
        HocKy: req.body.semester,
        NamHoc: req.body.year,
        MaLop: req.body.id
    }
    await timetableModel.addTimetable(timetable)
    const clss = await classModel.findClassById(req.body.id)
    const semester = []
    for (let i = 1; i <= 2; i++) {
        const temp = await timetableModel.findSemesterTimetableInClass(req.body.id, i)
        if (temp.length === 0)
            semester.push({HocKy: i})
    }
    res.render('admin/class-timetable-add', {
        layout: "admin.hbs",
        class: true,
        clss: clss[0],
        added: true,
        semester
    })
})

router.post('/class/timetable/delete', async function (req, res) {
    await timetableModel.deleteAllDetailTimetable(req.body.id)
    await timetableModel.deleteTimetable(req.body.id)
    res.redirect(req.headers.referer || `/admin/class/timetable?id=${req.body.cId}`)
})

router.get('/class/timetable/detail', async function (req, res) {
    const subjects = await subjectModel.getAllSubject()
    const listOne = await timetableModel.getDetailTimetableByTime('7:15')
    const listTwo = await timetableModel.getDetailTimetableByTime('8:05')
    const listThree = await timetableModel.getDetailTimetableByTime('9:10')
    const listFour = await timetableModel.getDetailTimetableByTime('10:00')
    const listFive = await timetableModel.getDetailTimetableByTime('10:50')
    const listSix = await timetableModel.getDetailTimetableByTime('13:00')
    const listSeven = await timetableModel.getDetailTimetableByTime('13:50')
    const listEight = await timetableModel.getDetailTimetableByTime('14:40')
    const listNine = await timetableModel.getDetailTimetableByTime('15:40')
    const listTen = await timetableModel.getDetailTimetableByTime('16:30')
    res.render('admin/class-timetable-detail', {
        layout: "admin.hbs",
        class: true,
        subjects,
        id: req.query.id,
        listOne,
        listTwo,
        listThree,
        listFour,
        listFive,
        listSix,
        listSeven,
        listEight,
        listNine,
        listTen
    })
})

router.post('/class/timetable/detail/add', async function (req, res) {
    if (req.body.subject) {
        const detail = {
            MaMon: req.body.subject
        }
        const check = await timetableModel.findDetailTimetableExist(req.body.id, req.body.time, req.body.day)
        if (check.length !== 0)
            await timetableModel.updateDetailTimetable(req.body.id, req.body.time, req.body.day, req.body.subject)
        else {
            detail.MaTKB = req.body.id
            detail.ThoiGianBD = req.body.time
            detail.NgayHoc = req.body.day
            await timetableModel.addDetailTimetable(detail)
        }
    }
    res.redirect(req.headers.referer || `/class/timetable/detail?id=${req.body.id}`)
})

router.post('/class/timetable/detail/delete', async function (req, res) {
    const check = await timetableModel.findDetailTimetableExist(req.body.id, req.body.time, req.body.day)
    if (check.length !== 0)
        await timetableModel.deleteDetailTimeTable(req.body.id, req.body.time, req.body.day)
    res.redirect(req.headers.referer || `/class/timetable/detail?id=${req.body.id}`)
})


export default router