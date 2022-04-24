import accountModel from "../models/account-model.js";

function nullifyAccount(req, res) {
    req.session.login = false;
    req.session.accountAuth = null;
    return res.redirect('/login')
}

export default async function auth(req, res, next) {
    if (req.session.login === false || typeof (req.session.login) === 'undefined') {
        req.session.retUrl = req.originalUrl;
        return res.redirect('/login');
    }
    const role = await accountModel.getRole(req.session.accountAuth.MaTaiKhoan);
    if (req.session.accountAuth.LoaiTaiKhoan !== role[0].LoaiTaiKhoan){
        return res.redirect('/login')
    } else {
        if (req.baseUrl === '/admin') {
            if (req.session.accountAuth.LoaiTaiKhoan !== 4){
                nullifyAccount(req, res)
            }
        } else if (req.baseUrl === '/student') {
            if (req.session.accountAuth.LoaiTaiKhoan !== 2) {
                nullifyAccount(req, res)
            }
        } else {
            if (req.session.accountAuth.LoaiTaiKhoan === 2 || req.session.accountAuth.LoaiTaiKhoan === 4) {
                nullifyAccount(req, res)
            }
        }
    }
    next();
}