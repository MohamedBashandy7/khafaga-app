import { ipcHandle } from "../utils.js"
import { store } from "../store.js"

type ThemeSettings = {
    type: "image" | "gradient"
    value: string
}

export function registerStoreIPC() {
    ipcHandle("theme:set", async (theme: ThemeSettings) => {
        store.set("theme", theme)
    })

    ipcHandle("theme:get", async () => {
        return store.get("theme")
    })
}
