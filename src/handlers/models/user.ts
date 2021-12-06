import { model as createModel, Schema, Document } from 'mongoose'

interface User extends Document {
    username: string,
    secQuestion: {
        id: number,
        answer: string
    },
    token: string,
    hwid: string
}

const UserSchema: Schema = new Schema({
    username: String,
    secQuestion: {
        id: Number,
        answer: String
    },
    token: String,
    hwid: String
}, { timestamps: true })

export default createModel<User>('user', UserSchema)