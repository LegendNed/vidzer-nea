import Store from 'electron-store'
import { Store as StoreSchema } from '../config/schemas'
import { watch } from 'chokidar'

export default class {
    store: Store;
    listeners: Map<string, any>

    constructor() {
        this.listeners = new Map()
        this.store = new Store({
            name: 'paths',
            schema: StoreSchema.paths,
            watch: true // Allow to watch changes in store
        })

        this.init()
        this.store.onDidAnyChange(this.storeChange)
    }

    init = () => {
        for (const [name, path] of Object.entries(this.store.store)) {
            const watcher = watch(path as string, {
                awaitWriteFinish: true,
                ignoreInitial: true
            })
            watcher.on('all', console.log)
        }
    }

    storeChange = (changes: any) => {
        console.log(changes)
    }
}