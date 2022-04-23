import adminRoute from '../routes/admin-route.js'
import teacherRoute from '../routes/teacher-route.js'
import studentRoute from "../routes/student-route.js"
import authRoute from "../routes/auth-route.js"
import auth from "../middlewares/auth.mdw.js"

export default function (app) {
    app.use('/admin', auth, adminRoute)
    app.use('/', authRoute)
    app.use('/student', auth, studentRoute)
    app.use('/teacher', auth, teacherRoute)

    app.use(function (req, res) {
        res.render('404', { layout: false });
    });

    app.use(function (err, req, res) {
        console.error(err.stack)
        res.render('500', { layout: false });
    });
}