import { useEffect } from "react";

function App() {

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      App jalan
    </div>
  );
}

export default App;
