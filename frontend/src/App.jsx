import { useEffect } from "react";

export default function App() {

  useEffect(() => {
    fetchItems?.();
  }, []);

  useEffect(() => {
    fetchTasks?.();
  }, []);

  return <div>App jalan</div>;
}
