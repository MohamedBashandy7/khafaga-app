import { ipcMain } from "electron"
import type { WebContents, WebFrameMain } from "electron"
import { getUIPath } from "./pathResolver.js"
import { pathToFileURL } from "url"

export function isDev(): boolean {
    return process.env.NODE_ENV === "development"
}

export function ipcHandle<Key extends keyof EventPayloadMapping, Args extends unknown[] = []>(
    channel: Key,
    handler: (...args: Args) => Promise<EventPayloadMapping[Key]>
) {
    ipcMain.handle(channel, (event, ...args) => {
        if (!event.senderFrame) {
            throw new Error("Invalid frame: senderFrame is null")
        }
        validationEventFrame(event.senderFrame)
        return handler(...(args as Args))
    })
}

export function ipWebContentsSend<Key extends keyof EventPayloadMapping>(
    channel: Key,
    webContents: WebContents,
    payload: EventPayloadMapping[Key]
) {
    webContents.send(channel, payload)
}

export function validationEventFrame(frame: WebFrameMain) {
    if (isDev() && new URL(frame.url).host === "localhost:5123") {
        return
    }
    if (frame.url !== pathToFileURL(getUIPath()).toString()) {
        throw new Error("Invalid frame URL")
    }
}
