import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import './css/APIQuotaDisplay.css';

function APIQuotaDisplay() {
    const APIQuota = useSelector((state: RootState) => state.quota.quota);
    const [isQuotaModalShown, setIsQuotaModalShown] = React.useState(false);
    const MAX_QUOTA = 10000;

    const quotaPercentage = Math.min((APIQuota / MAX_QUOTA) * 100, 100);

    React.useEffect(() => {
        if (isQuotaModalShown) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isQuotaModalShown])

    return (
        <div className='quota-parentDiv'>
            <div className='quota-2ndParentDiv'>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>API Quota Usage(approximate)</h1>
                <button className='questionMarkButton' onClick={() => setIsQuotaModalShown(true)}
                >
                    ?
                </button>
            </div>
            {isQuotaModalShown && (
                <div className='quotaModal'>
                    <div className='quotaModalInner'>
                        <h1>API Quota Usage</h1>
                        <p>
                            Because of youtube API restrictions, only a limited number of requests can be made per day.
                            The number is 10,000, so most likely the limit won't be reached.
                        </p>
                        <div style={{ marginTop: '20px' }}>
                            <p style={{ padding: 0 }}>Example usage if 5 videos URLs were provided:</p>
                            <p style={{ margin: 0 }}><strong>5 videos - 5 tokens(1 token/video)</strong></p>
                            <p style={{ margin: 0 }}><strong>500 comments per video<em>(current limit. Could be less)</em> - 75 tokens(15 tokens/500 comments).</strong></p>
                            <p style={{ margin: 0 }}><strong>Maximum quota usage per custom video URLs request(5 videos, all 500 or more comments) - 80 tokens.</strong></p>
                        </div>
                        <button onClick={() => setIsQuotaModalShown(false)}>Close</button>
                    </div>
                </div>
            )}
            <div className='quotaBar-Outer'>
                <div style={{
                    width: `${quotaPercentage}%`,
                    height: '100%',
                    backgroundColor: quotaPercentage > 80 ? '#e74c3c' : '#2ecc71', // Red if > 80%
                    transition: 'width 0.5s ease-in-out',
                    borderRadius: '8px 0 0 8px'
                }} />
            </div>
            <p style={{
                marginTop: '10px',
                fontSize: '1rem'
            }}>
                {APIQuota} / {MAX_QUOTA} used ({quotaPercentage.toFixed(2)}%)
            </p>
        </div>
    );
}

export default APIQuotaDisplay;
