import { BrowserWindow, IpcMainEvent, dialog } from 'electron'
import Store from 'electron-store'
import { Store as StoreSchema } from '../../config/schemas'

const store = new Store({
    name: 'paths',
    schema: StoreSchema.paths,
})

export default async function (this: { win: BrowserWindow }, event: IpcMainEvent, data: any) {
    switch (data.action) {
        case 'add': {
            const { name, path } = data
            if (store.has(name)) return event.returnValue = false
            if (Object.keys(store.store).length >= 4) return event.returnValue = false

            store.set(name, path)
            return event.returnValue = true
        }
        case 'remove': {
            const { name } = data
            if (!store.has(name)) return event.returnValue = false

            store.delete(name)
            return event.returnValue = true
        }
        case 'get': {
            return event.returnValue = store.store
        }
        case 'update': {
            const { name, newName, path } = data
            if (!store.has(name)) return event.returnValue = false

            if (newName) {
                const curPath = store.get(name)
                store.delete(name)
                store.set(newName, curPath)
                return event.returnValue = true
            }

            store.set(name, path)
            return event.returnValue = true
        }
        case 'directory': {
            const result = await dialog.showOpenDialog(this.win, {
                message: 'Select directory to watch',
                defaultPath: '%userprofile%\\Videos',
                properties: ['openDirectory'],
            })

            if (result.canceled) return event.returnValue = false

            return event.returnValue = result.filePaths[0]
        }
        default: return event.returnValue = false
    }
}