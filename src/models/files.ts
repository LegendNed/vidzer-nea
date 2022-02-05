import { model as createModel, Schema, Document, ObjectId } from 'mongoose'

interface File extends Document {
    metadata: { [key: string]: any },
    name: string,
    uriID: string,
    parent: ObjectId[],
    type: string,
    contents: any[]
}

const FileSchema: Schema = new Schema({
    metadata: Object,
    name: String,
    uriID: String,
    parent: Array,
    type: String,
    contents: Array
}, { timestamps: true })

export default createModel<File>('file', FileSchema)