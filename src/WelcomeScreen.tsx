import React from 'react';
import './css/WelcomeScreen.css';

interface props {
    showWelcomeScreen: React.Dispatch<React.SetStateAction<boolean>>
}

function WelcomeScreen({ showWelcomeScreen }: props) {
    return (
        <div className='welcomeScreenParent'>
            <div className='welcomeScreenInner'>
                <h1>Youtube Comment Visualizer</h1>
                <p>This project is a visualization of the comments between Youtube videos.</p>
                <p>You can provide up to 5 youtube videos and see how the comments on them intersect.</p>
                <p>If the same user commented on the same videos, a connection will be made between them.</p>
                <p>The comment limit is 500(because of API usage quota), so the best result would be gotten by providing videos of the same channel, that have up to 500 comments.</p>
                <p>Click on the button below to start!</p>
                <button onClick={() => showWelcomeScreen(false)}>Start</button>
            </div>
        </div>
    );
};

export default WelcomeScreen;