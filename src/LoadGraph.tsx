import React from 'react';
import { graphResponse } from './App';
import LoadGraph_2d from './LoadGraph_2d';
import LoadGraph_3d from './LoadGraph_3d';

function LoadGraph({ graphData }: { graphData: graphResponse }) {
    const graphType = React.useRef((localStorage.getItem('graphType') as '2d' | '3d') || '2d');
    return (
        <>
            {graphType.current === '2d' ? (
                <LoadGraph_2d graphData={graphData} />
            ) : (
                <LoadGraph_3d graphData={graphData} />
            )}
        </>
    );
};

export default LoadGraph;