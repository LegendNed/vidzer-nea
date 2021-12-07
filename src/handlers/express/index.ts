import express, { Application } from 'express'
import cookieParser from 'cookie-parser'
export default class {
    app: Application;

    constructor() {
        this.app = express()

        this.init()
    }

    private init(): void {
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(cookieParser(process.env.SECRET))

        this.initRouter()
        this.app.listen(8080, console.log.bind(console, 'Server is running on port 8080'))
    }

    private initRouter(): void {

    }
}