import { Router } from 'express'

import { join } from 'path'
import { createReadStream } from 'fs'

import File from '../../../models/files'

const app = Router()
app.get('/:id', async (req, res) => {
    let { id } = req.params
    if (!id) return res.send('Not Found')

    let document = await File.findOne({ uriID: id })
    if (!document) return res.send('Not Found')

    let path = join(__dirname, '../../../../storage/', `${document.name}.jpg`)

    res.writeHead(200, {
        'Content-Type': 'image/jpg',
    })

    createReadStream(path).pipe(res)
})

export default app