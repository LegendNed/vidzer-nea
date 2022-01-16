import RequestHandler from './requestHandler';

interface WindowExtended extends Window {
    ipc: {
        send: (message: string, data?: any) => any;
        on: (channel: string, listener: (data: any) => void) => any;
    },

    domain: string
}

export default {
    install: (app: any) => {
        // Allow exposed content to be used without type errors 
        const Window: WindowExtended = window as unknown as WindowExtended;

        const Requester = new RequestHandler(Window.domain);
        app.provide('request', Requester);
    }
}