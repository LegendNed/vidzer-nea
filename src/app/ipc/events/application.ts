import { BrowserWindow, IpcMainEvent } from 'electron'
import Registry from 'winreg'

export default function (this: { win: BrowserWindow }, event: IpcMainEvent, data: any) {
    switch (data.action) {
        case 'minimize':
            this.win.minimize()
            break
        case 'close':
            this.win.close()
            break
        case 'hwid':
            // Obtain registirys from HKEY_LOCAL_MACHINE which contains the HWID
            const regKey = new Registry({
                hive: Registry.HKLM,
                key: '\\SOFTWARE\\Microsoft\\Cryptography',
            })

            //Obtain HWID and resolve it
            regKey.get('MachineGuid', (error: any, item: any) => {
                if (error) return event.returnValue = null

                return event.returnValue = item.value
            })
            break
    }
}