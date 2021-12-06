import { model as createModel, Schema, Document } from 'mongoose'

interface Token extends Document {
    expireAt: Date,
    expired: boolean,
    token: string,
}

const TokenSchema: Schema = new Schema({
    expireAt: Date,
    expired: Boolean,
    token: String,
}, { timestamps: true })

export default createModel<Token>('token', TokenSchema)