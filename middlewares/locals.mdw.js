export default function(app){
    app.use(async function (req, res, next){
        if (typeof (req.session.login) == 'undefined'){
            req.session.login = false;
        }
        res.locals.loginAuth = req.session.login;
        res.locals.accountAuth = req.session.accountAuth;
        next();
    });
}