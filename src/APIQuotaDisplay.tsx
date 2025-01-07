import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import './css/APIQuotaDisplay.css';

function APIQuotaDisplay() {
    const APIQuota = useSelector((state: RootState) => state.quota.quota);
    const MAX_QUOTA = 10000;

    const quotaPercentage = Math.min((APIQuota / MAX_QUOTA) * 100, 100);

    return (
        <div className='quota-parentDiv'>
            <div className='quota-2ndParentDiv'>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>API Quota Usage</h1>
                <button className='questionMarkButton' onClick={() => alert('API Quota Usage is the percentage of your API quota that you have used. You have a maximum of 10,000 API requests per day.')}
                >
                    ?
                </button>
            </div>

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
