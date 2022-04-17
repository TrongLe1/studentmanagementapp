import express from 'express'
import teacherModel from '../models/teacher-model.js'
import classModel from '../models/class-model.js'
import studentModel from '../models/student-model.js'

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

router.get('/teaching-class/scores', function (req, res) {
    res.render('teacher/score-list', {
        layout: "teacher.hbs",
        teaching_class: true,
        result,
        nexPage,
        curPage,
        prevPage
    })
})

router.get('/homeroom-class/students', function(req, res) {
    res.render('teacher/students-list', {
        layout: "teacher.hbs",
        homeroom_class: true
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