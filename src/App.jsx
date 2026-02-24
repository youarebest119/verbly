import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'

const letters = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
]

const App = () => {
    const [modifier, setModifier] = useState("ctrl")
    const [key, setKey] = useState("i")

    const getInitialShortcut = () => {
        chrome.storage.sync.get(["globalShortcut"], (data) => {
            if (data.globalShortcut) {
                console.log('data.globalShortcut: ', data.globalShortcut);
                // setModifier(data.globalShortcut.modifier)
                // setKey(data.globalShortcut.key)
            }
        })
    }

    useEffect(() => {
        getInitialShortcut()
    }, [])

    return (
        <div className="extension-container">
            <div className="card mb-4">
                <h4 className="title">Keyboard Shortcut</h4>
                <p className="subtitle">Choose a key combination</p>

                <div className="shortcut-row">
                    <select
                        value={modifier}
                        onChange={(e) => setModifier(e.target.value)}
                    >
                        <option value="ctrl">Ctrl</option>
                        <option value="shift">Shift</option>
                        <option value="alt">Alt</option>
                    </select>

                    <span className="plus">+</span>

                    <select
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                    >
                        {letters.map((letter) => (
                            <option key={letter} value={letter}>
                                {letter.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <Button className="save-btn">
                    Save Changes
                </Button>

                <div className="current-shortcut">
                    Current:
                    <span className="badge">
                        {modifier.toUpperCase()} + {key.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default App