import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    console.log("App jalan");
  }, []);

  return <div>App jalan</div>;
}
