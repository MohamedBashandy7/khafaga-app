import theme1 from "../../../assets/themes/1.png"
export async function applyTheme() {
    const theme = await window.electron.theme.get()
    if (theme["type"] === "image" && theme["value"] === "") {
        document.body.style.backgroundImage = `url(${theme1})`
    } else if (theme.type === "image") {
        document.body.style.backgroundImage = `url(${theme.value})`
    } else {
        document.body.style.backgroundImage = theme.value
    }
    document.body.style.backgroundSize = "cover"
    document.body.style.backgroundPosition = "center"
    document.body.style.backgroundRepeat = "no-repeat"
}
