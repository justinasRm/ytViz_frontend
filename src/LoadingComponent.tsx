import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';

interface LoadingComponentProps {
    loading: boolean; // Controls whether the component is loading or fading out
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({ loading }) => {
    const [isVisible, setIsVisible] = useState(loading);

    useEffect(() => {
        if (!loading) {
            // Start fade-out when `loading` becomes false
            const fadeOutTimer = setTimeout(() => {
                setIsVisible(false); // After fade-outTime, hide the component
            }, 1000); // Convert seconds to milliseconds

            return () => clearTimeout(fadeOutTimer); // Cleanup on unmount
        } else {
            setIsVisible(true); // Show the component when `loading` is true
        }
    }, [loading]);

    if (!isVisible) return null; // Completely unmount after fade-out completes

    return (
        <div
            className={`loaderParent ${loading ? 'fade-in' : 'fade-out'}`}
            style={{ transitionDuration: `1s` }}
        >
            <p>Loading...</p>
            <ReactLoading
                type={'bars'}
                color={'rgba(50, 50, 100, 0.95)'}
                width={'300px'}
                className='loader'
            />
        </div>
    );
};

export default LoadingComponent;
