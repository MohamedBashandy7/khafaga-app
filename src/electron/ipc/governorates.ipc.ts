import { ipcHandle } from "../utils.js"
import * as governoratesService from "../services/governorates.service.js"

export function registerGovernoratesIPC() {
    ipcHandle("governorates:getAll", async () => {
        return governoratesService.getAllGovernorates()
    })
}
