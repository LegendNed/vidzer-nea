import mongoose, { ConnectOptions } from 'mongoose'

export const connect = async () => {
    let env: boolean = process.env.NODE_ENV === 'DEV'
    let url: string = env ? process.env.DEV_DB_URL : process.env.DB_URL
    let username: string = env ? process.env.DEV_DB_USERNAME : process.env.DB_USERNAME
    let password: string = env ? process.env.DEV_DB_PASSWORD : process.env.DB_PASSWORD


    return new Promise(async (resolve: (arg0: void) => void) => {
        mongoose.set('debug', true)
        await mongoose
            .connect(url, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                loggerLevel: env ? 'debug' : null, //Enable debugging when developing
                user: username,
                pass: password,
            } as ConnectOptions)


        mongoose.connection.on('connecting', () => console.info('database connecting'))
        mongoose.connection.on('connected', () => resolve(console.info('database connected')))
        mongoose.connection.on('disconnecting', () => console.info('database disconnecting'))
        mongoose.connection.on('disconnected', () => console.info('database disconnected'))
        mongoose.connection.on('error', () => console.error('database error'))
    })
}
