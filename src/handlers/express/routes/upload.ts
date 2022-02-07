import { Router } from 'express'
import Auth from '../authenticator'

import ffmpegPath from 'ffmpeg-static'
import { exec } from 'child_process'
import { join } from 'path'
import { Types } from 'mongoose'
// @ts-ignore
import shell from 'any-shell-escape'
import { unlink, statSync } from 'fs'

import File from '../../../models/files'

import multer from 'multer'
const upload = multer({
    storage: multer.diskStorage({}),
    limits: {
        fileSize: 1.573e+8, // 150 MB Limit
        files: 1
    }
})

import { customAlphabet, urlAlphabet } from 'nanoid'
// Allow url friendly custom ID - Available 64^3
const nanoid = customAlphabet(urlAlphabet, 3)

// Generates new UUID using database model, while ensuring for no duplicates
const generateUUID = async (): Promise<Types.ObjectId> => {
    let id = new Types.ObjectId()
    if (await File.exists({ _id: id })) return await generateUUID()

    return id
}

// Generates unique ID for the video, while ensuring for no duplicates
const generateURIID = async (): Promise<string> => {
    let id = nanoid()
    if (await File.exists({ uriID: id })) return await generateURIID()

    return id
}

const app = Router()
app.use(Auth) // Ensure Auth is enabled and checked
app.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(200).send({ success: false, message: 'No file was provided' })

    // Validate if the file is under 150MB and is a video
    const file = req.file
    if (Number((file.size / 1.049e+6).toFixed(2)) > 150) return res.status(200).send({ success: false, message: 'File uploaded is too large, must be under 150MB!' })
    if (!file.mimetype.startsWith('video/')) return res.status(200).send({ success: false, message: 'File uploaded is not an video!' })

    // Ensure the backend received metadata from frontend, while being correct format
    let metadata = req.body.metadata
    if (!metadata) return res.status(200).send({ success: false, message: 'No video metadata was found' })
    try {
        metadata = JSON.parse(metadata)
    } catch (e) {
        return res.status(200).send({ success: false, message: 'Video metadata is not valid' })
    }

    const id = await generateUUID()
    const output = join(__dirname, '../../../../storage/', `${id}.mp4`)

    // Using parameters from decomposition inside a shell
    // escaper ensure injection attacks can occur with 'UUID' /s
    let command = shell([
        //ffmpeg -i input.mp4 -filter:v scale=1280:-1 -b:v 7087k -b:a 130k -ar 44100 -r 60 output.mp4
        ffmpegPath,
        '-i', file.path,
        '-vcodec', 'h264_nvenc',
        '-filter:v', 'scale=1920:-1',
        '-b:v', '7087k',
        '-b:a', '130k',
        '-ar', '44100',
        '-r', '60',
        output
    ])

    // Promisify the promise in order to allow asynchronous code
    let execute = await new Promise(resolve => exec(command, resolve))
    if (execute) return res.status(200).send({ success: false, message: 'Failed to process video file' })

    // Remove the temporary file from the OS temp directory
    await new Promise(resolve => unlink(file.path, resolve))

    //Generate video thumbnail
    command = shell([
        ffmpegPath,
        '-ss', '00:00:01.00',
        '-i', output, // Using compressed video as thumbnail
        '-vf', "scale=320:320:force_original_aspect_ratio=decrease",
        '-vframes', '1',
        join(__dirname, '../../../../storage/', `${id}.jpg`)
    ])

    // Promisify the promise in order to allow asynchronous code
    await new Promise(resolve => exec(command, resolve))

    // Get stats of the new file created by ffmpeg
    let stats = await statSync(output)

    const model = {
        name: id,
        uriID: await generateURIID(),
        type: 'file',
        metadata: {
            name: file.originalname,
            created: metadata.birthtime,
            compression: Math.floor(Number((stats.size / metadata.size) * 100))
        }
    }

    await File.create(model)

    return res.status(200).send({ success: true, data: model })
})

export default app