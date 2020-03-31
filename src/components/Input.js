import React from 'react'

//TODO: Add emotion css

export default ({ onChange }) => {
  const handleSubmit = async (e) => {
    e.preventDefault()
    onChange(e.target.elements.url.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        required
        placeholder="Input Path of Building URL"
        type="text"
        name="url"
        className="h-10 w-full border border-dark rounded-lg py-2 px-4 block appearance-none leading-normal text-primary bg-primary"
        pattern="https?:\/\/pastebin.com\/[a-zA-Z0-9]{8}"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 mt-3 mr-4 bg-white"
      >
        <i className="gg-enter text-primary bg-primary" />
      </button>
    </form>
  )
}
