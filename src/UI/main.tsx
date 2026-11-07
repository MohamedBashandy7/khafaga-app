import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { applyTheme } from "./Admin/shared/ThemeLoader"

applyTheme().then(() => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    )
})
