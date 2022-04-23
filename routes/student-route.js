import express from 'express';
import studentModel from "../models/student-model.js";
import relativeModel from "../models/relative-model.js";
import tuitionModel from "../models/tuition-model.js";
import examModel from "../models/exam-model.js";
import timetableModel from "../models/timetable-model.js";

const router = express.Router();

router.get('/score', async function (req, res) {

    let stud = req.session.student
    let studClass = req.session.class

    let chooseSemesterList = await studentModel.getChooseSemesterAndYearList(stud.MaHocSinh)
    if(chooseSemesterList.length === 0){
        res.render('student/score', {
            layout: "student.hbs", flag: false,
            msg: "Hiện bạn không có điểm thi của học kì nào! Vui lòng quay lại sau, cảm ơn!"
        })
        return
    }

    let hocky = req.query.HocKy || chooseSemesterList[0].HocKy
    let namhoc = req.query.NamHoc || chooseSemesterList[0].NamHoc

    for (let i in chooseSemesterList){
        chooseSemesterList[i].isSelected = chooseSemesterList[i].HocKy == hocky
            && chooseSemesterList[i].NamHoc == namhoc;
    }
    // console.log(chooseSemesterList)

    let scoreListBySemesterAndYear = await studentModel.getListSubjectScoresByHKNH(5, hocky, namhoc)
    // console.log(scoreListBySemesterAndYear)
    res.render('student/score', {
        layout: "student.hbs", flag: true,
        chooseList: chooseSemesterList,
        scoresList: scoreListBySemesterAndYear, studentClass: studClass.TenLop
    })
})

router.post('/score', function (req, res) {
    // console.log(req.body.value)
    let result = req.body.value.split('/')
    res.redirect(`/student/score?HocKy=${result[0]}&NamHoc=${result[1]}`)
})

router.get('/', function (req, res) {
    res.render('student/home', {
        layout: "student.hbs"
    })
})

router.get('/profile', async function (req, res) {

    let stud = req.session.student
    let studClass = req.session.class
    let relatives = await relativeModel.findInfoRelative(stud.MaHocSinh)

    res.render('student/profile', {
        layout: "student.hbs",
        student: stud, studentClass: studClass.TenLop, relatives
    })
})

router.get('/profile/edit' , async function (req, res) {

    let stud = req.session.student
    let studClass = req.session.class
    let relatives = await relativeModel.findInfoRelative(stud.MaHocSinh)

    res.render('student/edit-profile', {
        layout: "student.hbs",
        student: stud, studentClass: studClass.TenLop, relatives
    })
})

router.post('/profile/edit' , async function (req, res) {

    let student = req.body
    if( student.NgaySinh === ''){
        delete student.NgaySinh
    }
    // console.log(student, req.session.student)
    let val = await studentModel.updateStudent(student, req.session.student.MaHocSinh)
    // console.log(val)
    req.session.student = (await studentModel.findStudentById(req.session.student.MaHocSinh))[0]
    res.redirect("/student/profile");
})

router.get('/relative/edit/:MaPHHS' , async function (req, res) {

    let stud = req.session.student
    let studClass = req.session.class
    let relatives = await relativeModel.findInfoRelative(stud.MaHocSinh)

    let MaPHHS = req.params.MaPHHS
    let detailParent = await relativeModel.findInfoRelativeDetailt(MaPHHS)

    // console.log(detailParent)
    res.render('student/edit-relative', {
        layout: "student.hbs", relatives, detail: detailParent[0]
    })
})

router.post('/relative/edit/:MaPHHS' , async function (req, res) {

    let MaPHHS = req.params.MaPHHS
    let detail = req.body

    console.log(MaPHHS, detail)

    if(detail.NgaySinh === '')
        delete detail.NgaySinh
    let val = await relativeModel.updateRelativeDetail(detail, MaPHHS)
    res.redirect('/student/profile')
})

router.get('/time-table',async function (req, res) {

    let studClass = req.session.class
    let lastestTimeTable = await timetableModel.findLatestTimeTableScheduleOfClass(studClass.MaLop)

    let time715 = await timetableModel.findTimeTableOfClassByTimetableIDAndTime(lastestTimeTable.MaTKB, '7:15:00')
    let time805 = await timetableModel.findTimeTableOfClassByTimetableIDAndTime(lastestTimeTable.MaTKB, '8:05:00')
    let time910 = await timetableModel.findTimeTableOfClassByTimetableIDAndTime(lastestTimeTable.MaTKB, '09:10:00')
    let time1000 = await timetableModel.findTimeTableOfClassByTimetableIDAndTime(lastestTimeTable.MaTKB, '10:00:00')
    let time1050 = await timetableModel.findTimeTableOfClassByTimetableIDAndTime(lastestTimeTable.MaTKB, '10:50:00')
    let time1300 = await timetableModel.findTimeTableOfClassByTimetableIDAndTime(lastestTimeTable.MaTKB, '13:00:00')
    let time1350 = await timetableModel.findTimeTableOfClassByTimetableIDAndTime(lastestTimeTable.MaTKB, '13:50:00')
    let time1440 = await timetableModel.findTimeTableOfClassByTimetableIDAndTime(lastestTimeTable.MaTKB, '14:40:00')
    let time1540 = await timetableModel.findTimeTableOfClassByTimetableIDAndTime(lastestTimeTable.MaTKB, '15:40:00')
    let time1630 = await timetableModel.findTimeTableOfClassByTimetableIDAndTime(lastestTimeTable.MaTKB, '16:30:00')

    res.render('student/time-table', {
        layout: "student.hbs", lastestTimeTable, studClass, time715,
        time805,time910,time1000,time1050,time1300,time1350,time1440,time1540,time1630
    })
})

router.get('/exam-schedule', async function (req, res) {
    let studClass = req.session.class

    // let examScheduleList = await examModel.findExamByClassID(studClass.MaLop)
    let lastestExamSchedule = await examModel.findLatestExamSchedule()
    let schedule = await examModel.findSubjectScheduleByExamID(lastestExamSchedule.MaLichThi)

    res.render('student/exam-schedule', {
        layout: "student.hbs", studentClass: studClass.TenLop,schedule,
        exam: lastestExamSchedule
    })
})

router.post('/tuition', function (req, res) {
    let acc = req.body
    let s = acc.value.split(`/`)
    res.redirect(`/student/tuition?HocKy=${s[0]}&NamHoc=${s[1]}`)
})

router.get('/tuition',async function (req, res) {

    let stud = req.session.student
    let studClass = req.session.class
    let chooseList = await tuitionModel.findListHocKyAndNamHoc(studClass.MaLop)
    let flag = true

    if(chooseList.length < 1){
        res.render('student/tuition', {
            layout: "student.hbs", flag: false, msg: "Hiện tại năm học này chưa có học phí!"
        })
        return
    }

    let hky = req.query.HocKy || chooseList[0].HocKy
    let nhoc = req.query.NamHoc || chooseList[0].NamHoc

    for (let i in chooseList){
        chooseList[i].isSelected = chooseList[i].HocKy === hky && chooseList[i].NamHoc === nhoc;
    }

    let tuitions = await tuitionModel.findTuiTionBySpecificHKNHAndClassID(studClass.MaLop, hky,nhoc)
    let tong = 0;
    for(let item in tuitions){
        tong+= tuitions[item].TongTien
    }

    res.render('student/tuition', {
        layout: "student.hbs", student: stud,studentClass: studClass.TenLop,
        tuitions, chooseList, flag, tong
    })
})

export default router