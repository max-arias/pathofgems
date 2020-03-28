import React from 'react'

//TODO: Add emotion css

export default ({ onChange }) => {
  const handleSubmit = async (e) => {
    e.preventDefault()
    onChange(e.target.elements.url.value)
  }

  return (
    <div className="lg:col-start-2 flex items-center flex-col">
      <div className="relative h-10 w-4/5 lg:w-2/4">
        <form onSubmit={handleSubmit}>
          <input
            required
            placeholder="Input Path Of Building URL"
            type="text"
            name="url"
            className="h-10 w-full border rounded-lg py-2 px-4 block appearance-none leading-normal"
            pattern="https?:\/\/pastebin.com\/[a-zA-Z0-9]{8}"
            style={{ backgroundColor: '#0c0b0b', borderColor: '#141414', color: '#A38D6D' }}
          />
          <button
            type="submit"
            className="absolute right-0 top-0 mt-3 mr-4 bg-white"
          >
            <i className="gg-enter" style={{ color: '#A38D6D', backgroundColor: '#0c0b0b'}} />
          </button>
        </form>
      </div>
    </div>
  )
}
