import Store from 'electron-store'
import { Store as StoreSchema } from '../config/schemas'
import { watch } from 'chokidar'

import HandleUpload from './uploader'

export default class {
    store: Store;
    listeners: Map<string, any>

    constructor() {
        // Holding all watchers in order for the adding/removing system to work
        this.listeners = new Map()
        this.store = new Store({
            name: 'paths',
            schema: StoreSchema.paths,
            watch: true // Allow to watch changes in store
        })

        // Watch for changes in paths store
        this.store.onDidAnyChange(this.storeChange)
        this.init()
    }

    storeChange = (changes: any) => {
        /* Generates 2 arrays of objects which will be used to compare for changes */
        const current = Array.from(this.listeners.entries())
            .map((cur: any[]) => ({ name: cur[0], path: cur[1].path }))

        const change = Object.entries(changes)
            .map((cur: any[]) => ({ name: cur[0], path: cur[1] }))
        /* End of array generation */

        for (const item of current) {
            const removed = change.find((cur: any) => JSON.stringify(cur) === JSON.stringify(item))
            if (removed) continue

            /* If item is removed from array, checked using if found method,
               then get the listener, close it and remove it. */
            const listener = this.listeners.get(item.name)
            listener.watcher.close()
            this.listeners.delete(item.name)
        }

        for (const item of change) {
            const added = current.find((cur: any) => JSON.stringify(cur) === JSON.stringify(item))
            if (added) continue

            /* As check if exists above is done, then we add it using the same function from init */
            this.watch(item.name, item.path)
        }
    }

    init = () => {
        /* Get all paths from store and watch them */
        for (const [name, path] of Object.entries(this.store.store))
            this.watch(name, path as string)
    }

    watch = (name: string, path: string) => {
        /* Create watcher for path */
        const watcher = watch(path as string, {
            awaitWriteFinish: true,
            ignoreInitial: true
        })

        /* Add listener to watcher */
        this.listeners.set(name, { watcher, path })

        /* Listen to changes via new file creation */
        watcher.on('add', HandleUpload)
    }
}