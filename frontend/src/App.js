import { useEffect } from "react";

function App() {
  useEffect(() => {
    console.log("jalan");
  }, []);

  return (
    <div>
      <h1>Geunaseh Jeumala</h1>
    </div>
  );
}

export default App;
