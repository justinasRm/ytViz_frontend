import React from 'react';
import './css/ChooseDefaultGraph.css';
import Switch from './helpers/Switch';
import { VideoPlayer } from './helpers/Player';

interface ChooseDefaultGraphProps {
    setNumber: React.Dispatch<React.SetStateAction<number | null>>;
}
interface ErrorType {
    message: string;
    type: 'submitError' | 'other'
}
function ChooseDefaultGraph({ setNumber }: ChooseDefaultGraphProps) {
    const [graphType, setGraphType] = React.useState<'3d' | '2d'>((localStorage.getItem('graphType') as '2d' | '3d') || '2d');
    const [videoLinks, setVideoLinks] = React.useState<string[]>([]);
    const [inputValue, setInputValue] = React.useState<string>('');
    const [error, setError] = React.useState<ErrorType | null>(null);

    React.useEffect(() => {
        localStorage.setItem('graphType', graphType);
    }, [graphType]);

    const handleAddLink = () => {
        if (inputValue.trim() === '') {
            setError({ type: 'other', message: 'Video link cannot be empty.' });
            return;
        }
        if (videoLinks.length >= 5) {
            setError({ type: 'other', message: 'You can only add up to 5 video links.' });
            return;
        }
        const youtubeVidRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeVidRegex.test(inputValue.trim())) {
            setError({ type: 'other', message: 'Invalid video link format. Please use a valid URL.' });

            return;
        }
        if (videoLinks.includes(inputValue.trim())) {
            setError({ type: 'other', message: 'Video link already added.' });

            return;
        }

        setVideoLinks((prev) => [...prev, inputValue.trim()]);
        setInputValue('');
        setError(null);
    };

    const handleRemoveLink = (index: number) => {
        setVideoLinks((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmitLinks = async () => {
        if (videoLinks.length === 0) {
            setError({ type: 'other', message: 'Please add at least one video link before submitting.' });
            return;
        }
        setError(null);

        // const response = await fetch(`http://127.0.0.1:8000/default-graphs?graph_num=${number}`);
        console.log(videoLinks);
        const response = await fetch(`http://127.0.0.1:8000/make-video-graphs?links=${videoLinks.join(',')}`);
        const data = await response.json();
        if (!response.ok) {
            console.log(data);
            console.log('error')
            setError({ type: 'submitError', message: data.error || 'An unknown error occurred' });
            return;
        }


    };

    return (
        <div className='chooseDefaultGraph-parent'>
            <div className='chooseDefaultGraph-inner'>
                <h1 style={{ marginBottom: 5, marginTop: 0 }}>Choose an existing dataset or use videos you want(up to 5)</h1>
            </div>

            <div className='chooseGraphContainer'>
                {[
                    { label: 'Data set 1', nodes: 1200 },
                    { label: 'Data set 2', nodes: 1100 },
                    { label: 'Data set 3', nodes: 3300 },
                    { label: 'Data set 4', nodes: 10000 }
                ].map((dataset, index) => (
                    <div key={index}>
                        <h2>{dataset.label}</h2>
                        <p>Around {dataset.nodes} nodes</p>
                        <button onClick={() => setNumber(index + 1)}>Choose</button>
                    </div>
                ))}
            </div>

            <div className='videoLinksContainer' style={{ marginTop: '50px' }}>
                <h3 style={{ color: 'white', fontSize: '2rem' }}>Add Video Links</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type='text'
                        placeholder='Enter video link'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '1.5rem'
                        }}
                    />
                    <button onClick={handleAddLink}>
                        Add
                    </button>
                </div>
                {error && error.type == 'other' && <p className='errorMsg'>{error.message}</p>}
                <ul style={{ color: 'white', listStyle: 'none', padding: 0 }}>
                    {videoLinks.map((link, index) => (
                        <div className='videoLinkDiv'>
                            <button
                                onClick={() => handleRemoveLink(index)}
                            >
                                Remove
                            </button>
                            <VideoPlayer key={index} videoUrl={link} />
                        </div>
                    ))}
                </ul>
                <button
                    onClick={handleSubmitLinks}
                    className='clearButton'
                >
                    Submit Links
                </button>
                {error && error.type == 'submitError' && <div className='errorMsg'>{error.message}</div>}
            </div>

            <h3 style={{ marginTop: 100, color: 'white', fontSize: '2rem' }}>Set graph type</h3>
            <Switch
                isOn={graphType === '3d'}
                handleToggle={() => setGraphType(graphType === '3d' ? '2d' : '3d')}
            />
            <span style={{ color: 'white', marginTop: 20 }}>
                2D graphs are easier to render (less laggy)
            </span>
        </div>
    );
};

export default ChooseDefaultGraph;
