import React from 'react';
import ReactPlayer from 'react-player';

export function VideoPlayer({ videoUrl }: { videoUrl: string }) {
    return (
        <div style={{ maxWidth: '500px', margin: '10px auto' }}>
            <ReactPlayer
                url={videoUrl}
                controls={true}
                width='100%'
                height='300px'
            />
        </div>
    );
};
