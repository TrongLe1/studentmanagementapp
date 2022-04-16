export default function(app){

    app.use(async function (req, res, next){

        if (typeof (req.session.login) == 'undefined'){
            req.session.login = false;
        }

        if (typeof (req.session.account) == 'undefined'){
            req.session.account = null;
        }

        res.locals.loginAuth = req.session.login;
        res.locals.accountAuth = req.session.account;

        next();
    });

}