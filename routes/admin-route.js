import express from 'express';

const router = express.Router();

router.get('/', function (req, res) {
    res.render('admin/dashboard', {
        layout: "admin.hbs"
    })
})

export default router