import axios from 'axios';
export default class {
    /* URL being the base URL of the API, which will be concat'ed with target routes*/
    constructor(public domain: string) {
        this.init()
    }

    async init() {
        axios.defaults.headers.common['authorization'] = await (window as any).keytar.get();
    }

    get(url: string) {
        return axios
            .get(this.domain + url)
            .then(this.resolveStatus)
            .catch(this.resolveError)
    }

    /* Any form of data sent to the server will be handled with this function
     * Raw JSON data cannot be sent for packets, therefore it must be transformed
     * into a string that can be sent to the server. Headers define what type of data
     * we are uploading, in this case, JSON/text data. */
    post(url: string, data: any) {
        return axios
            .post(this.domain + url, data)
            .then(this.resolveStatus)
            .catch(this.resolveError)
    }

    //Validates for status errors, returning error to application, else returning response
    private resolveStatus(res: any) {
        if (res.status >= 200 && res.status < 300) return res.data

        const error: any = new Error(res.statusText)
        error.response = res
        throw { _: 1, error }
    }

    private resolveError(error: any) {
        const res = error.response
        if (!res?.data) return { _: 1, error }

        return res.data
    }
}
