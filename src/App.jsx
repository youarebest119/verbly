import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'

const toneOptions = [
    { value: "normal", label: "normal" },
    { value: "formal", label: "formal" },
    { value: "casual", label: "casual" },
    { value: "professional", label: "professional" },
    { value: "friendly", label: "friendly" },
]

const App = () => {
    const [store, setStore] = useState("")
    const [tone, setTone] = useState("normal")

    const getinitialTone = async () => {
        const { tone: storedTone } = await chrome.storage.local.get([
            "tone",
        ]);

        if (storedTone) {
            setTone(storedTone);
            setStore(storedTone);
        }
    }

    const handleSave = async () => {
        await chrome.storage.local.set({
            tone: tone,
        });
        setStore(tone);
    }

    useEffect(() => {
        getinitialTone()
    }, [])

    return (
        <div className="extension-container">
            <div className="card">
                <h4 className="title">Select Tone</h4>
                <p className="subtitle">Choose a Tone Option</p>

                <div className="shortcut-row">
                    <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                    >
                        {toneOptions.map((tone) => (
                            <option key={tone.value} value={tone.value}>
                                {tone.label.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <Button className="save-btn" onClick={handleSave} disabled={store === tone}>
                    Save Changes
                </Button>

                <div className="current-shortcut">
                    Current:
                    <span className="badge">
                        {tone.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default App