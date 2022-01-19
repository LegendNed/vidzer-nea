import { JSONSchemaType } from 'ajv'

interface StorePath {
    name: string,
    path: string
}
export const Store: JSONSchemaType<StorePath> = {
    'paths': {
        name: {
            description: 'The nickname for the path',
            type: 'string',
            minLength: 0,
            maxLength: 16,
            pattern: '^[a-zA-Z0-9_]+$',
        },
        path: {
            description: 'The path to watch file changes',
            type: 'string',
            minLength: 3,
            pattern: `/^([a-z]:((\|/|\\|//))|(\\|//))[^<>:"|?*]+/i`
        }
    }
}