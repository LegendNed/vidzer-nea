import { Router } from 'express'
import Auth from '../authenticator'

import File from '../../../models/files'

const app = Router()
app.use(Auth) // Ensure Auth is enabled and checked
app.get('/', async (req, res) => {
    const { hwid } = req['user'];
    if (!hwid) return res.status(200).send({ success: false, message: 'No HWID was provided' });

    // Using find will return an array of documents matching the query
    // Unlike findOne returning only one document
    const files = await File.find({ hwid })

    return res.status(200).send({ success: true, data: files });
})

export default app