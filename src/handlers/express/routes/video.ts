import { Router } from 'express'

import { join } from 'path'
import { statSync, createReadStream } from 'fs'

import File from '../../../models/files'

const app = Router()
app.get('/:id', async (req, res) => {
    let { id } = req.params
    if (!id) return res.render('404')

    // Check if the parameter ends with .mp4, if does slice to get ID
    let isVideo = false
    if (id.endsWith('.mp4')) {
        isVideo = true
        id = id.replace('.mp4', '')
    }

    // Check if valid
    let document = await File.findOne({ uriID: id })
    if (!document) return res.render('404')

    let path = join(__dirname, '../../../../storage/', `${document.name}.mp4`)

    // If parameter ended with .mp4, output raw video to user.
    if (isVideo) {
        let stats = await statSync(path)

        // Tell browser that raw video is being streamed
        res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Content-Length': stats.size
        })

        return createReadStream(path).pipe(res)
    }

    // Obtain URL of site the backend is being hosted on
    const url = `${req.protocol}://${req.get('host')}`
    res.render('video', { // Render the video page
        title: document.metadata.name,
        thumbnail: `${url}/t/${id}`,
        upload_date: document.metadata.created,
        url: `${url}/v/${id}`,
        video_url: `${url}/v/${id}.mp4`
    })
})

export default app