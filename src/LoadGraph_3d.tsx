import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import * as d3 from 'd3-force';
import * as THREE from 'three';
import { EdgeData, NodeData, graphResponse } from './App';
import { SelectedInfo, RenderableNode } from './LoadGraph_2d';
import { useAppDispatch } from './redux/hooks';
import { setLoadingWithDelay } from './redux/loadingSlice';

const imageCache = new Map<string, THREE.Texture>();

function getNodeBaseSize(node: NodeData): number {
    if (node.type === 'video') {
        return 60;
    } else {
        const subs = parseInt(node.subscriber_count ?? '0', 10) || 0;
        const computed = Math.sqrt(subs) / 10 + 10;
        return Math.min(60, computed);
    }
}

function createNodeObject(node: RenderableNode): THREE.Object3D {
    const baseSize = getNodeBaseSize(node);
    const isVideo = node.type === 'video';
    if (node.thumbnail_link) {
        const texture = imageCache.get(node.thumbnail_link);
        if (texture) {
            if (isVideo) {
                const geometry = new THREE.CircleGeometry(baseSize, 32);
                const material = new THREE.MeshBasicMaterial({
                    map: texture
                });

                const circle = new THREE.Mesh(geometry, material);
                return circle;
            } else {
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const sprite = new THREE.Sprite(spriteMaterial);
                sprite.scale.set(baseSize, baseSize, 1);
                return sprite;
            }
        }
    }

    const geometry = new THREE.SphereGeometry(baseSize / 2, 16, 16);
    const material = new THREE.MeshLambertMaterial({
        color: isVideo ? 0xcccccc : 0x1f78b4,
    });
    return new THREE.Mesh(geometry, material);
}

function LoadGraph_3d({ graphData }: { graphData: graphResponse }) {
    const graphRef = useRef<any>(null);

    const [selectedInfo, setSelectedInfo] = useState<SelectedInfo>(null);

    const memoizedGraphData = useMemo(
        () => ({
            nodes: graphData.nodes,
            links: graphData.edges,
        }),
        [graphData]
    );
    const dispatch = useAppDispatch();

    useEffect(() => {
        graphRef.current !== null && graphRef.current.refresh()
    }, [graphRef.current])

    const preloadImages = async (nodes: NodeData[], abortSignal: AbortSignal) => {
        const textureLoader = new THREE.TextureLoader();
        for (const node of nodes) {
            if (node.thumbnail_link && !imageCache.has(node.thumbnail_link)) {
                if (abortSignal.aborted) {
                    console.warn('Preloading aborted');
                    return;
                }
                textureLoader.load(
                    node.thumbnail_link,
                    (texture) => {
                        imageCache.set(node.thumbnail_link!, texture);
                    },
                    undefined,
                    (error) => {
                        console.error(`Failed to load image: ${node.thumbnail_link}`, error);
                        textureLoader.load(
                            process.env.PUBLIC_URL + '/defaultIcon.jpg',
                            (texture) => {
                                imageCache.set(node.thumbnail_link, texture);
                            },
                            undefined,
                            (error) => {
                                console.log('error after error..');

                                console.log(error);
                            }
                        );
                    }
                );

            }
        }
        dispatch(setLoadingWithDelay(false, 1));

    };
    useEffect(() => {
        const abortController = new AbortController();
        const { signal } = abortController;

        if (graphData.nodes) {
            preloadImages(graphData.nodes, signal);
        }

        return () => {
            // Trigger abort when the component unmounts
            abortController.abort();
            console.warn('Component unmounted, preloading aborted');
        };
    }, [graphData.nodes]);

    const handleNodeClick = useCallback(
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

    const handleLinkClick = useCallback(
        (
            link: {
                source: RenderableNode | string;
                target: RenderableNode | string;
                like_count?: number;
                comment?: string;
            },
            event: MouseEvent
        ) => {
            event.stopPropagation();
            if (graphRef.current) {
                graphRef.current.pauseAnimation();
            }
            setSelectedInfo((prev: SelectedInfo) => {
                if (
                    prev?.type === 'edge' &&
                    prev.data.source === link.source &&
                    prev.data.target === link.target
                ) {
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

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: 'black' }}>
            <div style={{ flex: 1 }}>
                <ForceGraph3D
                    ref={graphRef}
                    graphData={memoizedGraphData as any}
                    cooldownTime={3000}
                    warmupTicks={100}
                    // controlType="orbit"
                    nodeAutoColorBy={null}
                    nodeId="id"
                    linkSource="source"
                    linkTarget="target"
                    linkWidth={(link: EdgeData) =>
                        Math.min(Math.sqrt((link.like_count || 1) + 1) * 1.5, 5)
                    }
                    linkColor={() => 'rgba(100,100,255,0.8)'}
                    linkLabel={(link: EdgeData) =>
                        `${link.comment}\n${link.like_count ?? 0} likes.`
                    }
                    nodeLabel={(node: RenderableNode) =>
                        `ID: ${node.id}\nType: ${node.type}`
                    }
                    nodeThreeObject={createNodeObject}
                    nodeThreeObjectExtend={true}
                    onNodeClick={handleNodeClick}
                    onLinkClick={handleLinkClick}
                    enableNodeDrag={false}
                />
            </div>

            <div className="info-panel" style={{ width: '350px', padding: '10px', color: 'white' }}>
                {selectedInfo ? (
                    <>
                        <h1>
                            {selectedInfo.type === 'node'
                                ? selectedInfo.data.type.toUpperCase()
                                : 'Comment'}
                        </h1>
                        {selectedInfo.type === 'node' && (
                            <div>
                                {selectedInfo.data.type === 'video' && (
                                    <p>
                                        <strong>Title:</strong> {selectedInfo.data.title}
                                    </p>
                                )}
                                {selectedInfo.data.type === 'user' && (
                                    <p>
                                        <strong>Channel name:</strong>{' '}
                                        {selectedInfo.data.channel_title}
                                    </p>
                                )}
                                <p>
                                    <strong>Views:</strong> {selectedInfo.data.view_count}
                                </p>
                                {selectedInfo.data.type === 'video' && (
                                    <>
                                        <p>
                                            <strong>Likes:</strong> {selectedInfo.data.like_count}
                                        </p>
                                        <p>
                                            <strong>Comments:</strong>{' '}
                                            {selectedInfo.data.comment_count}
                                        </p>
                                    </>
                                )}
                                {selectedInfo.data.type === 'user' && (
                                    <>
                                        <p>
                                            <strong>Subscribers:</strong>{' '}
                                            {selectedInfo.data.subscriber_count}
                                        </p>
                                        <p>
                                            <strong>Videos:</strong> {selectedInfo.data.video_count}
                                        </p>
                                    </>
                                )}
                                {selectedInfo.data.thumbnail_link && (
                                    <img
                                        src={selectedInfo.data.thumbnail_link}
                                        alt={
                                            selectedInfo.data.channel_title
                                        }
                                        style={{
                                            width: '100%',
                                            borderRadius: '8px',
                                            marginTop: '10px',
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        {selectedInfo.type === 'edge' && (
                            <div>
                                <p>
                                    <strong>From channel: </strong>
                                    {typeof selectedInfo.data.source === 'object'
                                        ? selectedInfo.data.source.channel_title
                                        : selectedInfo.data.source}
                                </p>
                                <p>
                                    <strong>To video: </strong>
                                    {typeof selectedInfo.data.target === 'object'
                                        ? selectedInfo.data.target.type === 'video'
                                            ? selectedInfo.data.target.title
                                            : selectedInfo.data.target.channel_title
                                        : null}
                                </p>
                                <p>
                                    <strong>Likes:</strong> {selectedInfo.data.like_count}
                                </p>
                                <p>
                                    <strong>Comment:</strong> {selectedInfo.data.comment}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <p>No item selected</p>
                )}

                <hr />
            </div>
        </div>
    );
}

export default LoadGraph_3d;
