import express from 'express'
import bcrypt from 'bcryptjs'
import teacherModel from '../models/teacher-model.js'
import classModel from '../models/class-model.js'
import studentModel from '../models/student-model.js'
import subjectModel from '../models/subject-model.js'
import accountModel from '../models/account-model.js'

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/teacher/teaching-class')
})

router.get('/teaching-class', async function (req, res) {
    const limit = 3
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await teacherModel.getTeachingClass(1, limit, offset)
    const total = await teacherModel.countTeachingClass(1)
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('teacher/teaching-class', {
        layout: "teacher.hbs",
        teaching_class: true,
        result,
        nexPage,
        curPage,
        prevPage
    })
})

router.get('/teaching-class/students/:id', async function (req, res) {
    const limit = 9
    const classID = req.params.id
    const className = (await classModel.findClassById(classID))[0].TenLop
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await studentModel.getStudentInClass(classID, limit, offset)
    const total = await studentModel.countStudentInClass(classID)
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('teacher/students-list', {
        layout: "teacher.hbs",
        teaching_class: true,
        classID,
        className,
        result,
        nexPage,
        curPage,
        prevPage
    })
} )

router.get('/teaching-class/scores/:cid/:sid', async function (req, res) {
    const limit = 7
    const classID = req.params.cid
    const subjectID = req.params.sid
    const subject = (await subjectModel.findSubject(subjectID))[0]
    const className = (await classModel.findClassById(classID))[0].TenLop
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const students = await studentModel.getStudentInClass(classID, limit, offset)
    let chooseSemesterList = await studentModel.getChooseSemesterAndYearList(1)
    let hocky = req.query.HocKy || chooseSemesterList[0].HocKy
    let namhoc = req.query.NamHoc || chooseSemesterList[0].NamHoc
    for (let i in chooseSemesterList) {
        chooseSemesterList[i].isSelected = (chooseSemesterList[i].HocKy == hocky
            && chooseSemesterList[i].NamHoc == namhoc);
    }
    for (const student of students) {
        student.HeSo1 = []
        student.HeSo2 = []
        student.HeSo3 = []
        const scores = await studentModel.getStudentScoresInSubjectByHKNH(student.MaHocSinh, subjectID, hocky, namhoc)
        for (const score of scores) {
            if (score.HeSoDiem === 1.0) {
                student.HeSo1.push(score.SoDiem)
            } else if (score.HeSoDiem === 2.0) {
                student.HeSo2.push(score.SoDiem)
            } else {
                student.HeSo3.push(score.SoDiem)
            }
         }
        while (student.HeSo1.length < 4) {
            student.HeSo1.push("Chưa có")
        }
        while (student.HeSo2.length < 2) {
            student.HeSo2.push("Chưa có")
        }
        while (student.HeSo3.length < 1) {
            student.HeSo3.push("Chưa có")
        }
        if (student.HeSo1.includes("Chưa có") || student.HeSo2.includes("Chưa có") || student.HeSo3.includes("Chưa có")) {
            student.TongDiem = "Chưa có"
        } else {
            let totalScore = 0.0
            for (const hs1 of student.HeSo1) {
                totalScore += hs1
            }
            for (const hs2 of student.HeSo2) {
                totalScore += hs2 * 2.0
            }
            totalScore += student.HeSo3[0] * 3.0
            totalScore /= 11.0
            student.TongDiem = Math.round(totalScore * 100) / 100
        }
    }
    const total = await studentModel.countStudentInClass(classID)
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && students.length !== 0), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('teacher/score-list', {
        layout: "teacher.hbs",
        teaching_class: true,
        subjectName: subject.TenMonHoc,
        classID,
        subjectID,
        className,
        students,
        chooseList: chooseSemesterList,
        hocky,
        namhoc,
        nexPage,
        curPage,
        prevPage
    })
})

router.post('/teaching-class/scores/:cid/:sid', function (req, res) {
    let result = req.body.value.split('/')
    const classID = req.params.cid
    const subjectID = req.params.sid
    res.redirect(req.headers.referer ||'/teacher/teaching-class/scores/'+classID+'/'+subjectID+'/?HocKy='+result[0]+'&NamHoc='+result[1]+'')
})

router.post('/teaching-class/scores/:cid/:sid/edit', async function (req, res) {
    const classID = req.params.cid
    const subjectID = req.params.sid
    const studentID = req.body.id
    const hocky = req.query.HocKy
    const namhoc = req.query.NamHoc
    const hs1 = [req.body.diem0, req.body.diem1, req.body.diem2, req.body.diem3]
    const hs2 = [req.body.diem4, req.body.diem5]
    let hs3 = req.body.diem6
    let old_hs3 = 0.0
    const scores = await studentModel.getStudentScoresInSubjectByHKNH(studentID, subjectID, hocky, namhoc)
    for (let i = 0, j = 0, k = 0; i < scores.length; i++) {
        if (scores[i].HeSoDiem === 1.0) {
            if (hs1[k] !== '') {
                if (scores[i].SoDiem !== parseFloat(hs1[k])) {
                    scores[i].SoDiem = parseFloat(hs1[k])
                    hs1.splice(k, 1)
                    await studentModel.updateStudentScore(scores[i], scores[i].MaDiem)
                } else {
                    hs1.splice(k, 1)
                }
            } else {
                hs1.splice(k, 1)
            }
        } else if (scores[i].HeSoDiem === 2.0) {
            if (hs2[j] !== '') {
                if (scores[i].SoDiem !== parseFloat(hs2[j])) {
                    scores[i].SoDiem = parseFloat(hs2[j])
                    hs2.splice(j, 1)
                    await studentModel.updateStudentScore(scores[i], scores[i].MaDiem)
                } else {
                    hs2.splice(j, 1)
                }
            } else {
                hs2.splice(j, 1)
            }
        } else {
            old_hs3 = scores[i].SoDiem
            if (hs3 !== '') {
                if (scores[i].SoDiem !== parseFloat(hs3)) {
                    scores[i].SoDiem = parseFloat(hs3)
                    hs3 = ''
                    await studentModel.updateStudentScore(scores[i], scores[i].MaDiem)
                } else {
                    hs3 = ''
                }
            } else {
                hs3 = ''
            }
        }
    }
    for (const d of hs1) {
        if (d !== '') {
            const scoreEntity = {
                MaHocSinh: studentID,
                MaMon: subjectID,
                HocKy: hocky,
                NamHoc: namhoc,
                HeSoDiem: 1.0,
                SoDiem: parseFloat(d)
            }
            await studentModel.addStudentScore(scoreEntity);
        }
    }
    for (const d of hs2) {
        if (d !== '') {
            const scoreEntity = {
                MaHocSinh: studentID,
                MaMon: subjectID,
                HocKy: hocky,
                NamHoc: namhoc,
                HeSoDiem: 2.0,
                SoDiem: parseFloat(d)
            }
            await studentModel.addStudentScore(scoreEntity);
        }
    }
    if (hs3 !== '' && parseFloat(hs3) !== old_hs3) {
        const scoreEntity = {
            MaHocSinh: studentID,
            MaMon: subjectID,
            HocKy: hocky,
            NamHoc: namhoc,
            HeSoDiem: 3.0,
            SoDiem: parseFloat(hs3)
        }
        await studentModel.addStudentScore(scoreEntity);
    }
    console.log(scores)
    res.redirect(req.headers.referer || '/teacher/teaching-class/scores/' + classID + '/' + subjectID + '?HocKy=' + hocky + '&NamHoc=' + namhoc)
})

router.get('/homeroom-class/students', async function (req, res) {
    const limit = 8
    const homeroomClass = (await classModel.findHomeroomClass(1))[0]
    const className = (await classModel.findClassById(homeroomClass.MaLop))[0].TenLop
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await studentModel.getStudentInClass(homeroomClass.MaLop, limit, offset)
    const total = await studentModel.countStudentInClass(homeroomClass.MaLop)
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('teacher/students-list', {
        layout: "teacher.hbs",
        homeroom_class: true,
        classID: homeroomClass,
        className,
        result,
        nexPage,
        curPage,
        prevPage
    })
})

router.get('/homeroom-class/student/add', function (req, res) {
    res.render('teacher/add-student', {
        layout: "teacher.hbs"
    })
})

router.post('/homeroom-class/student/add', async function (req, res) {
    const dateParts = req.body.date.split('/')
    const date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    const student = {
        HoTen: req.body.name,
        NgaySinh: date,
        GioiTinh: req.body.gender,
        ThuocLop: (await classModel.findHomeroomClass(1))[0].MaLop
    }
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
        item.HoTen = item.HoTen.replace(/ /g, '')
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
    res.render('teacher/add-student', {
        layout: "teacher.hbs",
        homeroom_class: true,
        added: true
    })
})

router.post('/homeroom-class/student/delete', async function (req, res) {
    await studentModel.removeFromClass(req.body.id)
    res.redirect(req.headers.referer || '/teacher/homeroom-class/students')
})

router.get('/info', async function (req, res) {
    const teacherInfo = (await teacherModel.findTeacherById(1))[0]
    const homeroomClass = (await classModel.findHomeroomClass(1))[0]
    const className = (await classModel.findClassById(homeroomClass.MaLop))[0].TenLop
    console.log(teacherInfo)
    res.render('teacher/info', {
        layout: "teacher.hbs",
        teacher: teacherInfo,
        className
    })
})

router.post('/info/edit', async function (req, res) {
    console.log()
    const updateTeacher = {
        HoTen: req.body.info0,
        NgaySinh: req.body.date.format(),
        SDT: req.body.sdt,
        DiaChi: req.body.address,
        GioiTinh: parseInt(req.body.gender)
    }
    res.redirect(req.headers.referer || '/teacher/info')
})

export default router