import { useEffect } from "react"

function App() {
  useEffect(() => {
    console.log("App mounted")
  }, [])

  return <div>Hello from App.jsx</div>
}

export default App
