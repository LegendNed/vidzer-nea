import axios from 'axios';

export default class {
    //Define global variable types
    domain: string;

    /* URL being the base URL of the API, which will be concat'ed with target routes*/
    constructor(domain: string) {
        this.domain = domain
    }

    get(url: string) {
        return axios.get(this.domain + url)
            .then(this.resolveStatus)
            .catch((error: any) => ({ _: 1, error }))
    }

    /* Any form of data sent to the server will be handled with this function
     * Raw JSON data cannot be sent for packets, therefore it must be transformed
     * into a string that can be sent to the server. Headers define what type of data
     * we are uploading, in this case, JSON/text data. */
    post(url: string, data: any) {
        return axios.post(this.domain + url, data)
            .then(this.resolveStatus)
            .catch((error: any) => ({ _: 1, error }))
    }

    /* File data/buffer will be returned HTML input; therefore, it has to be appended
     * to the form data, and then sent to the server. The authentication token is mandatory 
     * as it will ensure that no one other than authenticated users can upload files. */
    upload(file: any, metadata: any) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("metadata", metadata);

        return axios.post(this.domain + "/api/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then(this.resolveStatus)
            .catch((error: any) => ({ _: 1, error }))
    }

    //Validates for status errors, returning error to application, else returning response
    private resolveStatus(res: any) {
        if (res.status >= 200 && res.status < 300) return res.json()

        const error: any = new Error(res.statusText)
        error.response = res
        throw { _: 1, error }
    }
}
