import React from 'react'

import Check from '../Check.js'

export default ({ gem, toggleGemChecked }) => {
  const toggleCheck = (gemId) => {
    toggleGemChecked(gemId)
  }

  return (
    <div className={`gem-container p-2 mb-2 bg-secondary relative ${gem.checked ? 'opacity-50' : ''}`}>
      <div className="absolute top-0 right-0 mr-2 mt-2">
        <Check checked={gem.checked} checkToggle={toggleCheck} gemId={gem.skillId} />
      </div>
      <div className="gem-title flex mb-2 items-center border-dark">
        <img
          src={`/lib/images/${gem.skillId}.png`}
          alt={gem.skillId}
          width="50"
        />
        <h4>
          <a
            target="_blank"
            rel="noopener"
            href={`https://pathofexile.gamepedia.com/${gem.name}`}
            className="underline"
          >
            {gem.name}
          </a>
        </h4>
      </div>

      <hr className="border-primary mb-2" />

      {!gem.questReward && !gem.vendorReward && (
        <span>
          This gem is not awarded to your class, you'll need to buy it.
        </span>
      )}

      {gem.questReward && gem.questReward.length && (
        <div className="gem-quest-reward">
          <span>Quest Reward</span>
          {gem.questReward.map((q) => (
            <div>
              <span>Act: {q.act}</span>
              <span>
                {' '}
                -{' '}
                <a
                  target="_blank"
                  rel="noopener"
                  href={`https://pathofexile.gamepedia.com/${q.questName}`}
                  className="underline"
                >
                  {q.questName}
                </a>
              </span>
            </div>
          ))}
        </div>
      )}

      {gem.vendorReward && gem.vendorReward.length && (
        <div className="gem-vendor-reward" style={{ marginTop: 12 }}>
          <span>Vendor Reward</span>
          {gem.vendorReward.map((v) => (
            <div>
              <span>Act: {v.act}</span>
              {v.questName && (
                <span>
                  {' '}
                  -{' '}
                  <a
                    target="_blank"
                    rel="noopener"
                    href={`https://pathofexile.gamepedia.com/${v.questName}`}
                    className="underline"
                  >
                    {v.questName}
                  </a>
                </span>
              )}
              <span> - {v.vendorName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
