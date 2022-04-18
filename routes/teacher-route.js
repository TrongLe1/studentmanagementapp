import express from 'express'
import teacherModel from '../models/teacher-model.js'
import classModel from '../models/class-model.js'
import studentModel from '../models/student-model.js'
import subjectModel from '../models/subject-model.js'

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
    const limit = 8
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
    const limit = 8
    const classID = req.params.cid
    const subjectID = req.params.sid
    const subject = (await subjectModel.findSubject(subjectID))[0]
    const className = (await classModel.findClassById(classID))[0].TenLop
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const students = await studentModel.getStudentInClass(classID, limit, offset)
    for (const student of students) {
        student.HeSo1 = []
        student.HeSo2 = []
        student.HeSo3 = []
        let scores = await studentModel.getStudentScoresInSubject(student.MaHocSinh, subjectID)
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
            student.HeSo1.push("Chưa có");
        }
        while (student.HeSo2.length < 2) {
            student.HeSo2.push("Chưa có");
        }
        while (student.HeSo3.length < 1) {
            student.HeSo3.push("Chưa có");
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
        nexPage,
        curPage,
        prevPage
    })
})

router.get('/homeroom-class/students', async function (req, res) {
    const limit = 8
    const homeroomClass = (await classModel.findHomeroomClass(1))[0];
    const className = (await classModel.findClassById(homeroomClass.ChuNhiemLop))[0].TenLop
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await studentModel.getStudentInClass(homeroomClass.ChuNhiemLop, limit, offset)
    const total = await studentModel.countStudentInClass(homeroomClass.ChuNhiemLop)
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
        className,
        result,
        nexPage,
        curPage,
        prevPage
    })
})

router.get('/homeroom-class/student/add', function (req, res) {
    res.render('teacher/add-student', {
        layout: "teacher.hbs",
        homeroom_class: true
    })
})

router.get('/info', function (req, res) {
    res.render('teacher/info', {
        layout:"teacher.hbs"
    })
})

export default router