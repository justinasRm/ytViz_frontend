import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';

interface LoadingComponentProps {
    loading: boolean;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({ loading }) => {
    const [isVisible, setIsVisible] = useState(loading);

    useEffect(() => {
        if (!loading) {
            const fadeOutTimer = setTimeout(() => {
                setIsVisible(false);
            }, 2000);

            return () => clearTimeout(fadeOutTimer);
        } else {
            setIsVisible(true);
        }
    }, [loading]);

    if (!isVisible) return null;

    return (
        <div
            className={`loaderParent ${loading ? 'fade-in' : 'fade-out'}`}
            style={{ transitionDuration: `2s` }}
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
