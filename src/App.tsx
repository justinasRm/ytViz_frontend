import React, { useEffect, useState } from 'react';
import './css/App.css';
import LoadGraph from './LoadGraph';
import ChooseDefaultGraph from './ChooseDefaultGraph';
import { setLoadingWithDelay } from './redux/loadingSlice';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import LoadingComponent from './LoadingComponent';

export interface BaseNode {
  id: string;
  channel_title: string;
  thumbnail_link: string;
  view_count: string;
}

export interface VideoNode extends BaseNode {
  type: 'video';
  comment_count: string;
  like_count: string;
  title: string;
}

export interface UserNode extends BaseNode {
  type: 'user';
  subscriber_count: string;
  video_count: string;
}

export type EdgeData = {
  source: string;
  target: string;
  like_count: number;
  comment: string;
};

export type NodeData = VideoNode | UserNode;

export type graphResponse = {
  nodes: NodeData[];
  edges: EdgeData[];
};

function App() {
  const [graphData, setGraphData] = useState<graphResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [number, setNumber] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loading.loading);
  const loadingFadeout = 5
  useEffect(() => {
    if (!number) return;
    const fetchGraphData = async (): Promise<void> => {
      try {
        dispatch(setLoadingWithDelay(true));
        setError(null);

        const response = await fetch(`http://127.0.0.1:8000/default-graphs?graph_num=${number}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result: graphResponse = await response.json();
        result.nodes.sort((a, b) => a.type === 'video' ? 1 : -1);
        setGraphData(result);
      } catch (err) {
        if (err instanceof Error) {
          console.log(err)
          setError(err.message || 'An unknown error occurred');
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    fetchGraphData();
  }, [number]);


  if (error) return <p>Error: {error}</p>;

  return (
    <div className="App">
      {<LoadingComponent loading={loading} />}
      {!graphData && <ChooseDefaultGraph setNumber={setNumber} />}
      {graphData && <>
        <button className='backButton' onClick={() => {
          setGraphData(null);
          setNumber(null);
        }}>Back</button>
        <LoadGraph graphData={graphData} />
      </>}
    </div>
  );
}

export default App;
