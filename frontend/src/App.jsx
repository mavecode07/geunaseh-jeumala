import { useEffect } from "react";

export default function App() {

  useEffect(() => {
    if (typeof fetchItems === "function") {
      fetchItems();
    }
  }, []);

  useEffect(() => {
    if (typeof fetchTasks === "function") {
      fetchTasks();
    }
  }, []);

  return <div>App jalan</div>;
}
