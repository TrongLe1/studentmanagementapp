import express from 'express';

const router = express.Router();


router.get('/', function (req, res) {
    res.render('student/home', {
        layout: "student.hbs"
    })
})

router.get('/profile', function (req, res) {
    res.render('student/profile', {
        layout: "student.hbs"
    })
})

router.get('/time-table', function (req, res) {
    res.render('student/time-table', {
        layout: "student.hbs"
    })
})

router.get('/exam-schedule', function (req, res) {
    res.render('student/exam-schedule', {
        layout: "student.hbs"
    })
})

router.get('/tuition', function (req, res) {
    res.render('student/tuition', {
        layout: "student.hbs"
    })
})

export default router