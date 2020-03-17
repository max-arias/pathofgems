import React from 'react'

import decode from '../utils/decode.js'

const corsProxy = 'https://api.allorigins.win/get?url=';

export default () => {
    const handleSubmit = async e => {
        e.preventDefault()
        const urlValue = e.target.elements.url.value;

        const urlToParse = new URL(urlValue)
        const rawUrlToParse = `${urlToParse.origin}/raw${urlToParse.pathname}`;

        const response = await fetch(`${corsProxy}${encodeURIComponent(rawUrlToParse)}`)
        const data = await response.json()

        const xml = await decode(data.contents)
        console.log(xml)
    }

    return (
        <div className="mt-20 col-start-2 flex items-center flex-col">
            <div className="relative h-10 w-2/4">
                <form onSubmit={handleSubmit}>
                    <input type="text" name="url" className="h-10 w-full bg-white focus:outline-none focus:shadow-outline border border-gray-200 rounded-lg py-2 px-4 block appearance-none leading-normal" pattern="https?:\/\/pastebin.com\/[a-zA-Z0-9]{8}"/>
                    <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
                        <i className="gg-enter" />
                    </button>
                </form>
            </div>
            <div class="error-message">Invalid URL. Format should be something like: https://pastebin.com/ATvtbm8s</div>
        </div>
    )
}
