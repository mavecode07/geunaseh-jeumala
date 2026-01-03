import { useEffect } from "react";

function App() {
  useEffect(() => {
    console.log("App mounted");
  }, []);

  return <div>Website jalan</div>;
}

export default App;
