import React, { useEffect, useState } from 'react';
import './App.css';
import LoadGraph from './LoadGraph';
import { graphResponse } from './types';

function App() {
  const [graphData, setGraphData] = useState<graphResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchGraphData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://127.0.0.1:8000/default-graphs?graph_num=1');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result: graphResponse = await response.json();
        setGraphData(result);
      } catch (err) {
        if (err instanceof Error) {
          console.log(err)
          setError(err.message || 'An unknown error occurred');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="App">
      {/* <LoadGraph graphData={graphData} /> */}
    </div>
  );
}

export default App;
