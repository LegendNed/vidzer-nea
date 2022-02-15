import { Router } from 'express'
import Auth from '../authenticator'
import { join as pathJoin } from 'path'
import { unlinkSync } from 'fs'

import File from '../../../models/files'

const app = Router()
app.use(Auth) // Ensure Auth is enabled and checked
app.post('/', async (req, res) => {
    const { hwid } = req['user'];
    if (!hwid) return res.status(200).send({ success: false, message: 'No HWID was provided' });

    const { key } = req.body;
    if (!key) return res.status(200).send({ success: false, message: 'No key was provided' });

    const exists = await File.exists({ name: key })
    if (!exists) return res.status(200).send({ success: false, message: 'File does not exist' });

    await unlinkSync(pathJoin(__dirname, '../../../../storage/', `${key}.mp4`));
    await unlinkSync(pathJoin(__dirname, '../../../../storage/', `${key}.jpg`));

    await File.deleteOne({ name: key });

    return res.status(200).send({ success: true });
})

export default app