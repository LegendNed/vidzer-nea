import mongoose, { ConnectOptions } from 'mongoose'

export const connect = async () => {
    let env: boolean = process.env.NODE_ENV === 'DEV'
    let url: string = env ? process.env.DEV_DB_URL : process.env.DB_URL
    let username: string = env ? process.env.DEV_DB_USERNAME : process.env.DB_USERNAME
    let password: string = env ? process.env.DEV_DB_PASSWORD : process.env.DB_PASSWORD

    mongoose.set('debug', env) //Needed somehow lol
    let database: any = await mongoose
        .connect(url, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            loggerLevel: env ? 'debug' : null, //Enable debugging when developing
            user: username,
            pass: password,
        } as ConnectOptions)

    let connection = database.connections[0]
    connection.on('connecting', () => console.info('database connecting'))
    connection.on('connected', () => console.info('database connected'))
    connection.on('disconnecting', () => console.info('database disconnecting'))
    connection.on('disconnected', () => console.info('database disconnected'))
    connection.on('error', () => console.error('database error'))
}
