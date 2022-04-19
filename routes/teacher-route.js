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
    res.redirect('/teacher/teaching-class/scores/'+classID+'/'+subjectID+'/?HocKy='+result[0]+'&NamHoc='+result[1]+'')
})

router.post('/teaching-class/scores/:cid/:sid/edit', async function (req, res) {
    const classID = req.params.cid
    const subjectID = req.params.sid
    const studentID = req.body.id
    const hocky = req.query.HocKy
    const namhoc = req.query.NamHoc
    const hs1 = [req.body.diem0, req.body.diem1, req.body.diem2, req.body.diem3]
    const hs2 = [req.body.diem4, req.body.diem5]
    const hs3 = req.body.diem6
    const scores = await studentModel.getStudentScoresInSubjectByHKNH(studentID, subjectID, hocky, namhoc)
    // chua xy lu truong hop nhap vao chua co
    for (const score of scores) {
        if (score.HeSoDiem === 1.0) {
            for (const d of hs1) {
                if (d !== "Chưa có") {
                    score.SoDiem = parseFloat(d)
                    hs1.splice(hs1.indexOf(d), 1)
                    break
                }
            }
        } else if (score.HeSoDiem === 2.0) {
            for (const d of hs2) {
                if (d !== "Chưa có") {
                    score.SoDiem = parseFloat(d)
                    hs2.splice(hs2.indexOf(d), 1)
                    break
                }
            }
        } else {
            if (hs3 !== "Chưa có") {
                score.SoDiem = parseFloat(hs3)
            }
        }
    }
    console.log(scores)
    res.redirect('/teacher/teaching-class/scores/' + classID + '/' + subjectID + '?HocKy=' + hocky + '&NamHoc=' + namhoc)
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

router.post('/teacher/homeroom-class/student/delete', function (req, res) {
    const studentID = req.body.id

})

router.get('/info', function (req, res) {
    res.render('teacher/info', {
        layout:"teacher.hbs"
    })
})

export default router