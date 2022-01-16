import { Router, Request, Response } from 'express'
import fileUpload from 'express-fileupload'
import Auth from '../authenticator'

import User from '../../../models/user'
import Token from '../../../models/token'

const app = Router()
app.use(Auth) // Ensure Auth is enabled and checked
app.use(fileUpload({

}))


export default app