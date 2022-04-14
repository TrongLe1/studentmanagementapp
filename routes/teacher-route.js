import express from 'express'
import bcrypt from 'bcryptjs'
import teacherModel from '../models/teacher-model.js'
import accountModel from '../models/account-model.js'
import classModel from '../models/class-model.js'
import subjectModel from '../models/subject-model.js'

const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/teacher/teaching-class')
})

router.get('/teaching-class', function (req, res) {
    res.render('teacher/teaching-class', {
        layout: "teacher.hbs",
        teaching_class: true
    })
})

router.get('/teaching-class/students', function(req, res) {
    res.render('teacher/students-list', {
        layout: "teacher.hbs",
        teaching_class: true
    })
} )

router.get('/teaching-class/scores', function (req, res) {
    res.render('teacher/score-list', {
        layout: "teacher.hbs",
        teaching_class: true
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