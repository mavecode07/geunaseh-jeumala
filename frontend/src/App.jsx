useEffect(() => {
  document.querySelectorAll('a[href*="emergent"]').forEach(el => {
    el.remove()
  })
}, [])
