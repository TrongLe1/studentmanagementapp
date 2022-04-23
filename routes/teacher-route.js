import express from 'express'
import moment from 'moment'
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
    const teacher = req.session.teacher
    const result = await teacherModel.getTeachingClass(teacher.MaGV, limit, offset)
    const total = await teacherModel.countTeachingClass(teacher.MaGV)
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
        teacher_name: teacher.HoTen,
        homeroom_teacher: req.session.isHomeroomTeacher,
        result,
        nexPage,
        curPage,
        prevPage
    })
})

router.get('/teaching-class/students/:id', async function (req, res) {
    const limit = 9
    const teacher = req.session.teacher
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
        homeroom_teacher: req.session.isHomeroomTeacher,
        teacher_name: teacher.HoTen,
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
    const teacher = req.session.teacher
    const subjectID = req.params.sid
    const subject = (await subjectModel.findSubject(subjectID))[0]
    const className = (await classModel.findClassById(classID))[0].TenLop
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const students = await studentModel.getStudentInClass(classID, limit, offset)
    let chooseSemesterList = await studentModel.getChooseSemesterAndYearList(students[0].MaHocSinh)
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
        homeroom_teacher: req.session.isHomeroomTeacher,
        subjectName: subject.TenMonHoc,
        classID,
        teacher_name: teacher.HoTen,
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
    const teacher = req.session.teacher
    const className = (await classModel.findClassById(teacher.ChuNhiemLop))[0].TenLop
    const students = await studentModel.getStudentNotInClass()
    const today = moment().format('YYYY-MM-DD')
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await studentModel.getStudentInClass(teacher.ChuNhiemLop, limit, offset)
    for (const student of result) {
        student.VangHoc = await studentModel.checkAbsent(student.MaHocSinh, today)
    }
    const total = await studentModel.countStudentInClass(teacher.ChuNhiemLop)
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
        homeroom_teacher: req.session.isHomeroomTeacher,
        teacher_name: teacher.HoTen,
        className,
        result,
        students,
        nexPage,
        curPage,
        prevPage
    })
})

router.post('/homeroom-class/student/add', async function (req, res) {
    const teacher = req.session.teacher
    const homeroomClass = (await classModel.findHomeroomClass(teacher.MaGV))[0]
    await studentModel.updateStudent({ThuocLop: homeroomClass.MaLop}, req.body.student)
    res.redirect(req.headers.referer || '/homeroom-class/students')
})

router.post('/homeroom-class/student/delete', async function (req, res) {
    await studentModel.removeFromClass(req.body.id)
    res.redirect(req.headers.referer || '/teacher/homeroom-class/students')
})

router.post('/homeroom-class/student/absent', async function (req, res) {
    const studentID = req.body.id
    const today = moment().format('YYYY-MM-DD')
    await studentModel.updateAchievement({
        LoaiThanhTich: -1,
        TenHoatDong: "Vắng học",
        DiemThanhTich: 5,
        NgayDienRa: today
    }, studentID)
    res.redirect(req.headers.referer || '/homeroom-class/students')
})

router.get('/homeroom-class/achievements/:cid', async function (req, res) {
    // const classID = req.params.cid
    // const className = (await classModel.findClassById(classID))[0].TenLop
    // const page = req.query.page || 1
    // const offset = (page - 1) * limit
    // const students = await studentModel.getStudentInClass(classID, limit, offset)
    // let chooseSemesterList = await studentModel.getChooseSemesterAndYearList(1)
    // let hocky = req.query.HocKy || chooseSemesterList[0].HocKy
    // let namhoc = req.query.NamHoc || chooseSemesterList[0].NamHoc
    // for (let i in chooseSemesterList) {
    //     chooseSemesterList[i].isSelected = (chooseSemesterList[i].HocKy == hocky
    //         && chooseSemesterList[i].NamHoc == namhoc);
    // }
    // for (const student of students) {

    const limit = 8
    const homeroomClass = (await classModel.findHomeroomClass(1))[0]
    const className = (await classModel.findClassById(homeroomClass.MaLop))[0].TenLop
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    const result = await teacherModel.getAchievements(limit, offset)
    for (const achieve of result) {
        achieve.DiemThanhTich *= achieve.LoaiThanhTich
    }
    const total = await teacherModel.countAchievements()
    let nPage = Math.floor(total / limit)
    if (total % limit > 0) nPage++
    let nexPage = {check: true, value: (+page + 1)}
    let curPage = {check: (+page > 0 && +page <= nPage && result.length !== 0), value: +page}
    let prevPage = {check: true, value: (+page - 1)}
    if (nexPage.value === nPage + 1) nexPage.check = false
    if (prevPage.value === 0) prevPage.check = false
    if (total === 0) curPage.check = false
    res.render('teacher/achievements', {
        layout: "teacher.hbs",
        homeroom_class: true,
        homeroom_teacher: req.session.isHomeroomTeacher,
        result,
        className,
        nexPage,
        curPage,
        prevPage
    })
})

router.post('/homeroom-class/achievement/delete', async function (req, res) {
    await teacherModel.removeAchievement(req.body.id)
    res.redirect(req.headers.referer || '/teacher/homeroom-class/achievements')
})

router.get('/info', async function (req, res) {
    const teacher = req.session.teacher
    const teacherInfo = (await teacherModel.findTeacherById(teacher.MaGV))[0]
    const result = (await classModel.findClassById(teacher.ChuNhiemLop))
    let className = 'Không có'
    if (result.length !== 0) {
        className = result[0].TenLop
    }
    res.render('teacher/info', {
        layout: "teacher.hbs",
        teacher: teacherInfo,
        teacher_name: teacher.HoTen,
        homeroom_teacher: req.session.isHomeroomTeacher,
        className
    })
})

router.post('/info/edit', async function (req, res) {
    const teacher = req.session.teacher
    const dateParts = req.body.date.split("/");
    const dateString = dateParts[2] + '/' + (dateParts[0].toString() + '/' + dateParts[1]).toString();
    const updatedTeacher = {
        HoTen: req.body.info0,
        NgaySinh: moment(dateString).format('YYYY-MM-DD'),
        SDT: req.body.sdt,
        DiaChi: req.body.info3,
        GioiTinh: parseInt(req.body.gender)
    }
    await teacherModel.updateTeacher(updatedTeacher,teacher.MaGV);
    res.redirect(req.headers.referer || '/teacher/info')
})

export default router