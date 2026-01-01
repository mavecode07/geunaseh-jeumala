useEffect(() => {
  fetchItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
