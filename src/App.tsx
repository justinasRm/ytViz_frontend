import React from 'react';
import { ForceGraph2D } from 'react-force-graph';
import * as d3 from 'd3-force';
import './App.css';

type SelectedInfo =
  | { type: 'node'; data: RenderableNode }
  | { type: 'edge'; data: { source: RenderableNode | string; target: RenderableNode | string; like_count: number; comment: string } }
  | null;

interface BaseNode {
  id: string;
  channel_title: string;
  thumbnail_link: string;
  view_count: string;
}

interface VideoNode extends BaseNode {
  type: 'video';
  comment_count: string;
  like_count: string;
  title: string;
}

interface UserNode extends BaseNode {
  type: 'user';
  subscriber_count: string;
  video_count: string;
}

export type NodeData = VideoNode | UserNode;

export type RenderableNode = NodeData & { x: number; y: number };

type EdgeData = {
  source: string;
  target: string;
  like_count: number;
  comment: string;
};

type ResponseType = {
  nodes: NodeData[];
  edges: EdgeData[];
};

const imageCache = new Map<string, HTMLImageElement>();

function preloadImages(nodes: NodeData[]) {
  nodes.forEach((node) => {
    if (node.thumbnail_link && !imageCache.has(node.thumbnail_link)) {
      const img = new Image();
      img.src = node.thumbnail_link;
      imageCache.set(node.thumbnail_link, img);
    }
  });
}

const drawNode = (node: RenderableNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
  const isVideo = node.type === 'video';
  const img = node.thumbnail_link && imageCache.get(node.thumbnail_link);
  const label = (isVideo && node.title) || node.channel_title || node.id;

  // Dynamic node size based on type and zoom level
  let baseSize = isVideo ? 200 : (Math.sqrt(parseInt(node.subscriber_count) || 0) / 10) + 10;
  baseSize = Math.min(200, baseSize); // Cap max size
  const size = baseSize / Math.sqrt(globalScale);
  const fontSize = isVideo ? 20 / Math.sqrt(globalScale) : 10 / Math.sqrt(globalScale);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (globalScale < 0.3) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
    ctx.fillStyle = isVideo ? '#CCC' : '#1f78b4';
    ctx.fill();
    return;
  }

  if (img && img.complete && img.naturalHeight !== 0) {
    const width = size; // Videos stay rectangular, users circular
    const height = isVideo ? (width / 16) * 9 : size;

    ctx.save();
    if (isVideo) {
      ctx.beginPath();
      ctx.rect(node.x - width / 2 - 5, node.y - height / 2 - 5, width + 10, height + 10);
    } else {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
    }

    ctx.clip();
    ctx.drawImage(img, node.x - width / 2 - 5, node.y - height / 2 - 5, width + 10, height + 10);
    ctx.restore();
  } else {

    // Fallback if image is missing or not ready
    ctx.beginPath();
    if (isVideo) {
      const width = size;
      const height = (width / 16) * 9;
      ctx.rect(node.x - width / 2, node.y - height / 2, width, height);
      ctx.fillStyle = '#CCC';
    } else {
      ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#1f78b4';
    }
    ctx.fill();
  }

  // labels when zoomed in
  if (globalScale > 0.5) {
    ctx.font = `bold ${fontSize}px Sans-Serif`;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    const labelY = node.y + 30 + (isVideo ? size / 4 : 0);

    ctx.strokeText(label, node.x, labelY);
    ctx.fillStyle = 'white';
    ctx.fillText(label, node.x, labelY);
  }
};


function App() {
  const [graphData, setGraphData] = React.useState<ResponseType>({ nodes: [], edges: [] });
  const memoizedGraphData = React.useMemo(() => ({
    nodes: graphData.nodes,
    links: graphData.edges,
  }), [graphData]);

  const graphRef = React.useRef<any>(null);
  const [strengthVideo, setStrengthVideo] = React.useState(-100);
  const [strengthUser, setStrengthUser] = React.useState(-500);
  // -100, -500 looks good when not a lot of comments.
  const [selectedInfo, setSelectedInfo] = React.useState<SelectedInfo>(null);


  React.useEffect(() => {
    fetch('http://127.0.0.1:8000/graph')
      .then((response) => response.json())
      .then((data: ResponseType) => {
        data.nodes.sort((a, b) => (a.type === 'video' ? 1 : -1));

        preloadImages(data.nodes);
        const uniqueNodes = Array.from(new Map(data.nodes.map(node => [node.id, node])).values());
        const uniqueEdges = Array.from(
          new Map(data.edges.map((edge) => [`${edge.source}-${edge.target}`, edge])).values()
        );

        setGraphData({
          nodes: uniqueNodes,
          edges: uniqueEdges
        });
      })
      .catch((error) => console.error('Error fetching graph data:', error));
  }, []);
  React.useEffect(() => {
    if (graphRef.current) {
      const chargeForce = d3.forceManyBody<RenderableNode>()
        .strength((node: RenderableNode) => (node.type === 'video' ? strengthVideo : strengthUser));

      const linkForce = d3.forceLink<RenderableNode, EdgeData>()
        .id((node: RenderableNode) => node.id)
        .distance((link: EdgeData) => {
          const baseDistance = 200;
          return baseDistance - Math.min(link.like_count || 0, 50) * 1.5;
        })
        .strength(0.5);

      const centerForce = d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2)
        .strength(0.05);

      const collideForce = d3.forceCollide<RenderableNode>()
        .radius((node: RenderableNode) => (node.type === 'video' ? 60 : 30))
        .strength(0.7);

      graphRef.current.d3Force('charge', chargeForce);
      graphRef.current.d3Force('link', linkForce);
      graphRef.current.d3Force('center', centerForce);
      graphRef.current.d3Force('collide', collideForce);

      // Only reheat simulation if the graphData changes, not on every click
      graphRef.current.d3ReheatSimulation();
    }
  }, [graphData, strengthVideo, strengthUser]);


  const handleNodeClick = React.useCallback(
    (node: RenderableNode, event: MouseEvent) => {
      event.stopPropagation();
      if (graphRef.current) {
        graphRef.current.pauseAnimation();
      }
      setSelectedInfo((prev) => {
        if (prev?.type === 'node' && prev.data.id === node.id) {
          return prev;
        }
        return { type: 'node', data: node };
      });

      setTimeout(() => {
        graphRef.current?.resumeAnimation();
      }, 0);
    },
    []
  );


  const handleLinkClick = React.useCallback(
    (
      link: { source: RenderableNode | string; target: RenderableNode | string; like_count?: number; comment?: string },
      event: MouseEvent
    ) => {
      event.stopPropagation();
      if (graphRef.current) {
        graphRef.current.pauseAnimation();
      }
      setSelectedInfo((prev: SelectedInfo) => {
        if (prev?.type === 'edge' && prev.data.source === link.source && prev.data.target === link.target) {
          return prev;
        }
        return {
          type: 'edge',
          data: {
            source: link.source,
            target: link.target,
            like_count: link.like_count ?? 0,
            comment: link.comment ?? 'No comment',
          },
        };
      });

      setTimeout(() => {
        graphRef.current?.resumeAnimation();
      }, 0);
    },
    []
  );

  const handleNodeDrag = React.useCallback(() => {
    if (graphRef.current) {
      graphRef.current.pauseAnimation();
    }
  }, []);

  const handleNodeDragEnd = React.useCallback(() => {
    if (graphRef.current) {
      graphRef.current.resumeAnimation();
    }
  }, []);





  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: 'black' }}>
      <div style={{ flex: 1 }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={memoizedGraphData as any} // mmmmm 'as any' thats perfect shitface. Types are just amazing here. Greaaaaaatttt. Ok relax its just debt for future.
          cooldownTime={3000}
          warmupTicks={100}
          nodeAutoColorBy={null}
          nodeId="id"
          linkSource="source"
          linkTarget="target"
          linkWidth={(link: EdgeData) => Math.min(Math.sqrt((link.like_count || 1) + 1) * 1.5, 5)}
          linkLabel={(link: EdgeData) => `${link.comment}\n${link.like_count ?? 0} likes.`}
          nodeLabel={(node: RenderableNode) => `ID: ${node.id}\nType: ${node.type}`}
          nodeCanvasObject={drawNode}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          onNodeDrag={handleNodeDrag}
          onNodeDragEnd={handleNodeDragEnd}
          nodeCanvasObjectMode={() => 'after'}
          linkCanvasObject={(
            link: { source: RenderableNode | string; target: RenderableNode | string; like_count?: number; comment?: string },
            ctx: CanvasRenderingContext2D,
            globalScale: number
          ) => {
            if (typeof link.source === 'string' || typeof link.target === 'string') return;

            const { source, target, like_count = 0 } = link;
            const startX = source.x;
            const startY = source.y;
            const endX = target.x;
            const endY = target.y;

            const maxLineWidth = Math.sqrt(like_count + 1) * 2;
            const startWidth = Math.max(maxLineWidth * 0.3, 1);
            const endWidth = Math.max(maxLineWidth * 0.3, 1);

            ctx.save();

            const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
            gradient.addColorStop(0, 'rgba(100, 100, 255, 0.3)');
            gradient.addColorStop(0.5, 'rgba(100, 100, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(100, 100, 255, 0.3)');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = maxLineWidth;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(startX, startY, startWidth, 0, 2 * Math.PI);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(endX, endY, endWidth, 0, 2 * Math.PI);
            ctx.fill();

            ctx.restore();
          }}
          enableNodeDrag={true}
        />


      </div>
      <div className='info-panel'>
        {selectedInfo ? (
          <>
            <h1>{selectedInfo.type === 'node' ? selectedInfo.data.type.toUpperCase() : "Comment"}</h1>
            {selectedInfo.type === 'node' && (
              <div>
                {selectedInfo.data.type === 'video' && <p><strong>Title:</strong> {selectedInfo.data.title}</p>}
                {selectedInfo.data.type === 'user' && <p><strong>Channel name:</strong> {selectedInfo.data.channel_title}</p>}
                <p><strong>Views:</strong> {selectedInfo.data.view_count}</p>
                {selectedInfo.data.type === 'video' && (
                  <>
                    <p><strong>Likes:</strong> {selectedInfo.data.like_count}</p>
                    <p><strong>Comments:</strong> {selectedInfo.data.comment_count}</p>
                  </>
                )}
                {selectedInfo.data.type === 'user' && (
                  <>
                    <p><strong>Subscribers:</strong> {selectedInfo.data.subscriber_count}</p>
                    <p><strong>Videos:</strong> {selectedInfo.data.video_count}</p>
                  </>
                )}
                <img
                  src={selectedInfo.data.thumbnail_link}
                  alt={selectedInfo.data.channel_title || selectedInfo.data.channel_title}
                  style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }}
                />
              </div>
            )}

            {selectedInfo.type === 'edge' && (
              <div>
                <p><strong>From channel </strong> {typeof selectedInfo.data.source === 'object' ? selectedInfo.data.source.channel_title : selectedInfo.data.source}</p>
                <p><strong>To video </strong> {typeof selectedInfo.data.target === 'object' ? selectedInfo.data.target.type === 'video' ? selectedInfo.data.target.title : selectedInfo.data.target.channel_title : null} </p>
                <p><strong>Likes:</strong> {selectedInfo.data.like_count}</p>
                <p><strong>Comment:</strong> {selectedInfo.data.comment}</p>
              </div>
            )}
          </>
        ) : (
          <p>No item selected</p>
        )}

        <hr />
        <h3>Settings</h3>
        <label>
          Video Strength:
          <input
            type="range"
            min={-5000}
            max={5000}
            value={strengthVideo}
            onChange={(event) => setStrengthVideo(Number(event.target.value))}
          />
        </label>
        <br />
        <label>
          User Strength:
          <input
            type="range"
            min={-5000}
            max={5000}
            value={strengthUser}
            onChange={(event) => setStrengthUser(Number(event.target.value))}
          />
        </label>
      </div>

    </div>
  );
}

export default App;
