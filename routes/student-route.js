import express from 'express';
import studentModel from "../models/student-model.js";
import classModel from "../models/class-model.js";
import relativeModel from "../models/relative-model.js";
import tuitionModel from "../models/tuition-model.js";
import examModel from "../models/exam-model.js";

const router = express.Router();


router.get('/student', function (req, res) {
    res.render('student/home', {
        layout: "student.hbs"
    })
})

router.get('/profile', async function (req, res) {
    // get local var -> stud
    let stud = await studentModel.findStudentById(5)
    let studClass = await classModel.findClassById(stud[0].ThuocLop)
    let relatives = await relativeModel.findInfoRelative(3)
    res.render('student/profile', {
        layout: "student.hbs",
        student: stud[0], studentClass: studClass[0].TenLop, relatives
    })
})

router.get('/time-table', function (req, res) {

    res.render('student/time-table', {
        layout: "student.hbs"
    })
})

router.get('/exam-schedule', async function (req, res) {
    let stud = await studentModel.findStudentById(5)
    let studClass = await classModel.findClassById(stud[0].ThuocLop)
    let examScheduleList = await examModel.findExamByClassID(stud[0].ThuocLop)

    let schedule = await examModel.findSubjectScheduleByExamID(examScheduleList[0])

    console.log(schedule)
    res.render('student/exam-schedule', {
        layout: "student.hbs", studentClass: studClass[0].TenLop,schedule
    })
})

router.post('/tuition', function (req, res) {
    let acc = req.body
    let s = acc.value.split(`/`)
    res.redirect(`/tuition?HocKy=${s[0]}&NamHoc=${s[1]}`)
})

router.get('/tuition',async function (req, res) {
    let stud = await studentModel.findStudentById(5)
    let studClass = await classModel.findClassById(stud[0].ThuocLop)
    let chooseList = await tuitionModel.findListHocKyAndNamHoc(studClass[0].MaLop)
    let flag = true

    if(chooseList.length < 1){
        flag = false
        res.render('student/tuition', {
            layout: "student.hbs", flag, msg: "Hiện tại năm học này chưa có học phí!"
        })
        return
    }

    let hky = req.query.HocKy || chooseList[0].HocKy
    let nhoc = req.query.NamHoc || chooseList[0].NamHoc

    for (let i in chooseList){
        chooseList[i].isSelected = chooseList[i].HocKy === hky && chooseList[i].NamHoc === nhoc;
    }

    let tuitions = await tuitionModel.findTuiTionBySpecificHKNHAndClassID(studClass[0].MaLop, hky,nhoc)
    let tong = 0;
    for(let item in tuitions){
        tong+= tuitions[item].TongTien
    }

    res.render('student/tuition', {
        layout: "student.hbs", student: stud[0],studentClass: studClass[0].TenLop,
        tuitions, chooseList, flag, tong
    })
})

export default router