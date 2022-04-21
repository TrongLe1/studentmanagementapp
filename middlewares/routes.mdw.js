import admin from '../routes/admin-route.js'
import teacher from '../routes/teacher-route.js'
import studentRoute from "../routes/student-route.js"

export default function (app) {
    function authAdmin(req, res, next) {
        if (req.session.login === false || typeof (req.session.login) === 'undefined') {
            req.session.retUrl = req.originalUrl
            return res.redirect('/login')
        }
        else if (req.session.accountAuth.LoaiTaiKhoan === 4)
            next()
        else if (req.session.accountAuth.LoaiTaiKhoan === 2)
            return res.redirect('/')
        else
            return res.redirect('/teacher')
    }
    app.use('/admin', authAdmin, admin)
    app.use('/', studentRoute)
    app.use('/teacher', teacher)
    app.use(function (req, res, next) {
        res.render('404', { layout: false });
    });

    app.use(function (err, req, res, next) {
        console.error(err.stack)
        res.render('500', { layout: false });
    });
}