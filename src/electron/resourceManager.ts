import osUtils from "os-utils"
import fs from "fs"
import { BrowserWindow } from "electron"
import os from "os"
import { ipWebContentsSend } from "./utils.js"
const POLLING_INTERVAL = 500
export function pollResources(mainWindow: BrowserWindow) {
    setInterval(async () => {
        const cpuUsage = await getCPUUtils()
        const RAMUsage = getRamUsage()
        const storageData = getSorageData()
        ipWebContentsSend("statistics", mainWindow.webContents, {
            cpuUsage,
            RAMUsage,
            storageData
        })
    }, POLLING_INTERVAL)
}

function getCPUUtils(): Promise<number> {
    return new Promise((resolve) => {
        osUtils.cpuUsage((usage: number) => {
            resolve(usage)
        })
    })
}

function getRamUsage() {
    return 1 - osUtils.freememPercentage()
}

function getSorageData() {
    const stats = fs.statfsSync(process.platform === "win32" ? "D://" : "/")
    const total = stats.bsize * stats.blocks
    const free = stats.bsize * stats.bfree
    const GB = 1024 ** 3
    return {
        total: Math.floor(total / GB),
        free: Math.floor(free / GB),
        used: Math.floor((total - free) / GB),
        freePercent: Math.round((free / total) * 100),
        usedPercent: Math.round(((total - free) / total) * 100)
    }
}

export function getStaticData() {
    const totalStorage = getSorageData().total
    const CPUModel = os.cpus()[0].model
    const totalMemoryGB = Math.floor(os.totalmem() / 1024)
    return {
        totalStorage,
        totalRAM: totalMemoryGB,
        totalCPU: os.cpus().length,
        CPUModel
    }
}
