import express, { Application } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import auth from './routes/auth'
import upload from './routes/upload'
import video from './routes/video'
import thumbnail from './routes/thumbnail'
import Fetch from './routes/fetch'
import Delete from './routes/delete'
export default class {
    app: Application;

    constructor() {
        this.app = express()
        this.init()
    }

    private init(): void {
        this.app.use(cookieParser(process.env.SECRET))
        this.app.use(cors({
            origin: '*',
            methods: ['GET', 'POST']
        }))

        this.app.use(express.static('views'))
        this.app.set('view engine', 'ejs');
        this.initRouter()
        this.app.listen(8000, console.log.bind(console, 'Server is running on port 8080'))
    }

    private initRouter(): void {
        this.app.use('/auth', express.json(), auth)
        this.app.use('/upload', express.json({ limit: '150mb' }), upload)
        this.app.use('/fetch', express.json(), Fetch)
        this.app.use('/delete', express.json(), Delete)
        this.app.use('/v', video)
        this.app.use('/t', thumbnail)
    }
}