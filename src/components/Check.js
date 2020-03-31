import React from 'react'

export default ({ checkToggle, checked, gemId }) => {

    return (
        <button className="cursor-pointer z-10" onClick={() => checkToggle(gemId)}>
            <i className={`gg-check ${checked ? 'bg-green-500' : ''}`}></i>
        </button>
    )
}
