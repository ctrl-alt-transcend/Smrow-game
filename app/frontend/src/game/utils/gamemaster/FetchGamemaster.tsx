
import { useState, useEffect } from "react"

function FetchGamemaster() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('/api/gamemaster/gamemasterGreetings')
          const result = await response.json()
          setData(result)
        } catch (error: any) {
          setError(error)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }, [])
    if (loading) {
      return <p>Loading data...</p>
    }
    if (error) {
      return <p>Error fetching data: {error}</p>
    }
    return <p> {data} </p>
};

export default FetchGamemaster;
