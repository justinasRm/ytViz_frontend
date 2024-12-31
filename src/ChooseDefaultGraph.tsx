import React from 'react';
import './css/ChooseDefaultGraph.css';
import Switch from './helpers/Switch';

function ChooseDefaultGraph({ setNumber }: { setNumber: React.Dispatch<React.SetStateAction<number | null>> }) {

    const [graphType, setGraphType] = React.useState<'3d' | '2d'>((localStorage.getItem('graphType') as '2d' | '3d') || '2d');

    React.useEffect(() => {
        localStorage.setItem('graphType', graphType);
    }, [graphType]);

    return (
        <div className='chooseDefaultGraph-parent'>
            <div className='chooseDefaultGraph-inner'>
                <h1>Data set 1</h1>
                <p></p>
            </div>
            <div className='chooseGraphContainer'>
                <div>
                    <h2>Data set 1</h2>
                    <p>Graph Description</p>
                    <button onClick={() => { setNumber(1) }}>Choose</button>
                </div>
                <div>
                    <h2>Data set 2</h2>
                    <p>Graph Description</p>
                    <button onClick={() => { setNumber(2) }}>Choose</button>
                </div>
                <div>
                    <h2>Data set 3</h2>
                    <p>Graph Description</p>
                    <button onClick={() => { setNumber(3) }}>Choose</button>

                </div>
                <div>
                    <h2>Data set 4</h2>
                    <p>Graph Description</p>
                    <button onClick={() => { setNumber(4) }}>Choose</button>

                </div>
            </div>
            <h3 style={{ marginTop: 100, color: 'white', fontSize: '2rem' }}>Set graph type</h3>
            <Switch isOn={graphType === '3d'} handleToggle={() => { setGraphType(graphType === '3d' ? '2d' : '3d') }} />
            <span style={{ color: 'white', marginTop: 20 }}>2D graphs are easier to render(less laggy)</span>

        </div>
    );
};

export default ChooseDefaultGraph;