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

export type graphResponse = {
    nodes: NodeData[];
    edges: EdgeData[];
};