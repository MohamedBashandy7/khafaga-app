import Store from "electron-store"

type StoreSchema = {
    theme: {
        type: "image" | "gradient"
        value: string
    }
    auth: string
}

export const store = new Store<StoreSchema>({
    defaults: {
        theme: {
            type: "image",
            value: ""
        },
        auth: ""
    }
})
