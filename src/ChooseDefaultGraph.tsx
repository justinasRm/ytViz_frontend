import React from 'react';
import './css/ChooseDefaultGraph.css';

function ChooseDefaultGraph({ setNumber }: { setNumber: React.Dispatch<React.SetStateAction<number | null>> }) {
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

        </div>
    );
};

export default ChooseDefaultGraph;