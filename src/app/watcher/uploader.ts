import { Stats, createReadStream } from 'fs'
import FormData from 'form-data'
import Path from 'path'
import keytar from 'keytar'
import { userInfo } from 'os'
import { execSync } from 'child_process'

import Formats from '../config/videoFormats'
import Notification from '../notification'

import axios from 'axios'
const DOMAIN = process.env.NODE_ENV !== 'production'
    ? 'http://localhost:8000'
    : 'someDomain.com'

/* File data/buffer will be returned HTML input; therefore, it has to be appended
 * to the form data, and then sent to the server. The authentication token is mandatory 
 * as it will ensure that no one other than authenticated users can upload files. */
const upload = async (file: any, metadata: any) => {
    axios.defaults.headers.common['authorization'] = await keytar.getPassword('auth', userInfo().username) || ''

    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", metadata);

    return axios.post(DOMAIN + "/upload", formData, {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
    })
        .then((res: any) => {
            if (res.status >= 200 && res.status < 300) return res.data

            const error: any = new Error(res.statusText)
            error.response = res
            throw { _: 1, error }
        })
        .catch((error: any) => {
            const res = error.response
            if (!res || !res.data) return { _: 1, error }

            return res.data
        })
}

export default async function (path: string, stats: Stats) {
    if (!path || !stats) return
    if (stats.isDirectory()) return

    const EXTENSIONS = Path.extname(path).slice(1)
    if (!Formats.includes(EXTENSIONS)) return

    const NAME = Path.basename(path, EXTENSIONS) // Providing extension removes the name
    const SIZE = (stats.size / 1.049e+6).toFixed(2) // Convert to MB and round to 2 decimal places

    // Create a system notification, as the user most likely wont have the application open
    if (Number(SIZE) > 150) return Notification({
        title: 'Vidzer - File too large',
        body: `${NAME} is too large! Ensure that clips are less than 150 MB.`,
        type: 'error'
    })

    const file = await createReadStream(path)
    const data = await upload(file, JSON.stringify(stats))

    if (data._) return Notification({
        title: 'Vidzer - Upload failed',
        body: `${NAME} failed to upload, either an error occurred or server offline.`,
        type: 'error'
    })

    if (typeof data === 'string' && data.includes('PayloadTooLargeError: request entity too large'))
        return Notification({
            title: 'Vidzer - File too large',
            body: `${NAME} is too large! Ensure that clips are less than 150MB`
        }) // Removing type doesn't sent a notification sound

    if (!data.success) return Notification({
        title: 'Vidzer - Upload failed',
        body: data.message,
        type: 'error'
    })

    const URI = process.env.NODE_ENV === 'production'
        ? 'some production uri'
        : 'http://localhost:8000/v/'
    execSync(`echo ${URI}${data.data.uriID} | clip`)

    return Notification({
        title: 'Vidzer - Upload successful',
        body: `${NAME} has been uploaded to Vidzer!`,
        type: 'success'
    })
}