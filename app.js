import express from 'express'
import viewMdw from './middlewares/views.mdw.js'
import localMdw from './middlewares/locals.mdw.js'
import routeMdw from './middlewares/routes.mdw.js'
import sessionMdw from './middlewares/session.mdw.js'
import {dirname} from 'path'
import {fileURLToPath} from 'url'
import morgan from 'morgan'
import bcrypt from "bcryptjs";
import accountModel from "./models/account-model.js";
import studentModel from "./models/student-model.js";
import classModel from "./models/class-model.js";

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: true
}))
app.use('/public', express.static('public'))
sessionMdw(app)
localMdw(app)
viewMdw(app)
routeMdw(app)

const port = 3000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})