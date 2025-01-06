import React from 'react';
import ReactLoading from 'react-loading';

interface OverlayLoadingWithTextProps {
    text: string;
}

const OverlayLoadingWithText: React.FC<OverlayLoadingWithTextProps> = ({ text }) => {
    const [displayText, setDisplayText] = React.useState(text);
    React.useEffect(() => {
        console.log('OverlayLoadingWithText rendered');

        const preventScroll = (event: Event) => {
            event.preventDefault();
        };

        window.addEventListener('scroll', preventScroll, { passive: false });
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });

        return () => {
            window.removeEventListener('scroll', preventScroll);
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
        };
    }, []);

    const messages = [
        ` Hold on...`,
        ` It's working I promise!`,
        ` Maybe a second or two more? 🤔`,
        ` Ok no more funny messages, just wait it out.`
    ];

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        let currentIndex = 0;

        const showNextMessage = () => {
            if (currentIndex < messages.length - 1) {
                setDisplayText((prev) => prev + messages[currentIndex]);
                currentIndex++;
                timer = setTimeout(showNextMessage, 2000);
            }
        };

        timer = setTimeout(showNextMessage, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            zIndex: 10
        }}>
            <div style={{
                color: 'white'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Loading</h2>
                <h3>{displayText}</h3>
            </div>
        </div>

    );
};

export default OverlayLoadingWithText;
