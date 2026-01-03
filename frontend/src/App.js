import { useEffect } from "react"

function App() {
  useEffect(() => {
    console.log("App mounted")
  }, [])

  return <div>Hello</div>
}

export default App
