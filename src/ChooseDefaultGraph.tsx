import React, { useRef } from 'react';
import './css/ChooseDefaultGraph.css';
import Switch from './helpers/Switch';
import { VideoPlayer } from './helpers/Player';
import { graphResponse } from './App';
import { useAppDispatch } from './redux/hooks';
import { setLoadingWithDelay, setMinimalLoadingWithText } from './redux/loadingSlice';
import APIQuotaDisplay from './APIQuotaDisplay';
import { updateAPIQuota } from './redux/APIQuotaSlice';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';

interface ChooseDefaultGraphProps {
    setNumber: React.Dispatch<React.SetStateAction<number | null>>;
    setGraphData: React.Dispatch<React.SetStateAction<graphResponse | null>>;
}
interface ErrorType {
    message: string;
    type: 'submitError' | 'other'
}
function ChooseDefaultGraph({ setNumber, setGraphData }: ChooseDefaultGraphProps) {
    const [graphType, setGraphType] = React.useState<'3d' | '2d'>((localStorage.getItem('graphType') as '2d' | '3d') || '2d');
    const [videoLinks, setVideoLinks] = React.useState<string[]>([]);
    const [inputValue, setInputValue] = React.useState<string>('');
    const [disabledCommentsVidID, setDisabledCommentsVidID] = React.useState<string | null>(null);
    const [error, setError] = React.useState<ErrorType | null>(null);
    const APIQuota = useSelector((state: RootState) => state.quota.quota);
    const abortControllerRef = useRef<null | AbortController>(null);
    const dispatch = useAppDispatch();


    React.useEffect(() => {
        localStorage.setItem('graphType', graphType);
    }, [graphType]);

    const parseErrorMessage = (message: string) => {
        const parts = message.split(/(<strong>.*?<\/strong>)/g); // only <strong> tags supported right now.
        return parts.map((part, index) => {
            if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
                return <strong key={index} style={{ color: '#ff0000' }}>{part.replace(/<\/?strong>/g, '')}</strong>;
            }
            return part;
        });
    };

    const handleAddLink = () => {
        if (inputValue.trim() === '') {
            setError({ type: 'other', message: 'Video link cannot be empty.' });
            return;
        }
        if (videoLinks.length >= 5) {
            setError({ type: 'other', message: 'You can only add up to 5 video links.' });
            return;
        }
        const youtubeVidRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([\w-]+)(&.*)?$/;

        if (!youtubeVidRegex.test(inputValue.trim())) {
            setError({ type: 'other', message: 'Invalid video link format. Please use a valid URL.' });

            return;
        }
        if (videoLinks.includes(inputValue.trim())) {
            setError({ type: 'other', message: 'Video link already added.' });

            return;
        }

        const match = inputValue.trim().match(youtubeVidRegex);
        console.log(match);
        if (match) {
            const videoId = match[1];
            const formattedUrl = `https://www.youtube.com/watch?v=${videoId}`;
            setVideoLinks((prev) => [...prev, formattedUrl]);
        } else {
            setVideoLinks((prev) => [...prev, inputValue.trim()]);
        }
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
        let linkMap = new Set()
        for (let i = 0; i < videoLinks.length; i++) {
            if (linkMap.has(videoLinks[i])) {
                setError({ type: 'submitError', message: `There are duplicate links. Please remove the duplicates.` });
                return;
            }
            linkMap.add(videoLinks[i]);
        }
        setError(null);
        dispatch(setMinimalLoadingWithText('Generating graphs...'));
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

        try {
            const response = await fetch(`${process.env.REACT_APP_APIPREFIX}/make-video-graphs?links=${videoLinks.join(',')}&commentCount=10000`, { signal });
            const data = await response.json();
            console.log('reponse:')
            console.log(data);
            dispatch(setMinimalLoadingWithText(false));
            if (!response.ok) { // 400
                if (data.error && data.error.includes('Comments dissabled')) {
                    const disabledCommentsVidIDVideoId = data.error.split('youtube.com/watch?v=')[1].slice(0, 11);
                    console.log(disabledCommentsVidIDVideoId);
                    setDisabledCommentsVidID(disabledCommentsVidIDVideoId);
                }
                setError({ type: 'submitError', message: data.error || 'An unknown error occurred' });
                return;
            }
            dispatch(setLoadingWithDelay(true, 2));
            setGraphData(data);
        } catch (err) {
            dispatch(setMinimalLoadingWithText(false));
            console.log(err);
            setError({ type: 'submitError', message: 'An unknown error occurred' });
            return;
        }


        return controller;
    };

    React.useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`${process.env.REACT_APP_APIPREFIX}/get-api-quota`);
                if (!response.ok) {
                    // will only happen if backend is completely down


                    return;
                }
                const data: { quota: number } = await response.json();
                dispatch(updateAPIQuota(data.quota));
            }
            catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, [])

    React.useEffect(() => {
        return () => {
            // Cleanup: Abort fetch if component unmounts
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return (
        <>
            <APIQuotaDisplay />
            <div className='chooseDefaultGraph-parent'>
                <div className='mobileViewDisclaimer-parent'>
                    <div className='mobileViewDisclaimer-inner'
                    >
                        <p>
                            This website uses WebGL, which is not optimized for mobile phones.
                            Because of performance limitations on mobile devices and viewing limitation on smaller screens the experience is not optimal.
                        </p>
                        <p>
                            Please use a desktop for the best experience.
                        </p>
                    </div>
                </div>
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
                {APIQuota >= 10000 ? <div>
                    <h3 style={{ color: 'red', fontSize: '2rem' }}><strong>API Quota Limit Reached</strong></h3>
                    <p style={{ color: 'red' }}>Sadly the API quota is <strong>at</strong> or <strong>around</strong> the 10,000 limit, so generating new graphs is not possible right now.</p>
                </div> :
                    <div className={`videoLinksContainer`} style={{ marginTop: '50px' }}>
                        <h3 style={{ color: 'white', fontSize: '2rem', marginBottom: 0 }}>Add Video Links</h3>
                        <p style={{ color: 'white', margin: 0 }}>Add up to 5 video links</p>
                        <p style={{ color: 'white', margin: 0, marginBottom: '30px' }}>Link format: https://www.youtube.com/watch?v=VIDEO_ID</p>
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
                                <div key={link.slice(-11)} className={`videoLinkDiv ${link.slice(-11) === disabledCommentsVidID && 'videoLinkDiv_disabledComments'}`} >
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
                        <button onClick={() => {
                            setVideoLinks([
                                'https://www.youtube.com/watch?v=SDTZ7iX4vTQ',
                                'https://www.youtube.com/watch?v=PWgvGjAhvIw',
                                'https://www.youtube.com/watch?v=gGdGFtwCNBE',
                                'https://www.youtube.com/watch?v=kYtGl1dX5qI',


                            ])
                        }}>
                            Fill in with default links
                        </button>
                        {error && error.type === 'submitError' && (
                            <div className='errorMsg'>
                                {parseErrorMessage(error.message)}
                            </div>
                        )}
                    </div>}

                <h3 style={{ marginTop: 100, color: 'white', fontSize: '2rem' }}>Set graph type</h3>
                <Switch
                    isOn={graphType === '3d'}
                    handleToggle={() => { alert('3D graphs have problems loading images for sprites, so some images may not be loaded 🫤'); setGraphType(graphType === '3d' ? '2d' : '3d') }}
                />
                <span style={{ color: 'white', margin: 20 }}>
                    2D graphs are easier to render (less laggy)
                </span>
            </div>
        </>

    );
};

export default ChooseDefaultGraph;
