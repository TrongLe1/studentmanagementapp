import accountModel from "../models/account-model.js";
export default async function auth(req, res, next) {
    if (req.session.login === false || typeof (req.session.login) === 'undefined') {
        req.session.retUrl = req.originalUrl;
        return res.redirect('/login');
    }
    const role = await accountModel.getRole(req.session.accountAuth.MaTaiKhoan);
    if (req.session.accountAuth.LoaiTaiKhoan !== role[0].LoaiTaiKhoan){
        return res.redirect('/login')
    }
    next();
}