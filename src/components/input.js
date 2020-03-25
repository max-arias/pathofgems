import React from 'react'

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
            className="h-10 w-full bg-white focus:outline-none focus:shadow-outline border border-gray-200 rounded-lg py-2 px-4 block appearance-none leading-normal"
            pattern="https?:\/\/pastebin.com\/[a-zA-Z0-9]{8}"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 mt-3 mr-4 bg-white"
          >
            <i className="gg-enter" />
          </button>
        </form>
      </div>
    </div>
  )
}
