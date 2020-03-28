import React from 'react'
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import { gemBaseUrl } from '../../utils/constants.js'

//TODO: emotion css

export default ({ data }) => {
    return (
        <VerticalTimeline>
            {Object.keys(data).map(lvl => {

                return (
                    <VerticalTimelineElement
                        date="Required level"
                        contentStyle={{
                            backgroundColor: '#0c0b0b',
                            color: '#fff',
                            borderColor: '#141414',
                            border: '1px solid',
                        }}
                        iconStyle={{
                            backgroundColor: '#141414',
                            color: '#141414',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}
                        icon={<span>{lvl}</span>}
                    >
                        <div>
                            {data[lvl].map(gem => {
                                return (
                                    <div className="gem-container" style={{ padding: '.5rem', marginBottom: '.5rem', backgroundColor: '#141414' }}>
                                        <div className="gem-title" style={{ display: 'flex', marginBottom: '.5rem', alignItems: 'center', borderColor: '#141414' }}>
                                            <img src={`/lib/images/${gem.skillId}.png`} alt={gem.skillId} width="50" />
                                            <h4>
                                                <a target="_blank" rel="noopener" href={`https://pathofexile.gamepedia.com/${gem.name}`} style={{ textDecoration: 'underline' }}>{gem.name}</a>
                                            </h4>
                                        </div>
                                        <hr style={{ borderColor: '#A38D6D', marginBottom: '.5rem' }} />

                                        {!gem.questReward && !gem.vendorReward && (
                                            <span>This gem is not awarded to your class, you'll need to buy it.</span>
                                        )}

                                        {gem.questReward && gem.questReward.length && (
                                            <div className="gem-quest-reward">
                                                <span>Quest Reward</span>
                                                {gem.questReward.map(q => (
                                                    <div>
                                                        <span>Act: {q.act}</span>
                                                        <span> - <a target="_blank" rel="noopener" href={`https://pathofexile.gamepedia.com/${q.questName}`} style={{ textDecoration: 'underline' }}>{q.questName}</a></span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {gem.vendorReward && gem.vendorReward.length && (
                                            <div className="gem-vendor-reward" style={{ marginTop: 12 }}>
                                                <span>Vendor Reward</span>
                                                {gem.vendorReward.map(v => (
                                                    <div>
                                                        <span>Act: {v.act}</span>
                                                        {v.questName && (<span> - <a target="_blank" rel="noopener" href={`https://pathofexile.gamepedia.com/${v.questName}`} style={{ textDecoration: 'underline' }}>{v.questName}</a></span>)}
                                                        <span> - {v.vendorName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </VerticalTimelineElement>
                )
            })}
        </VerticalTimeline>
    )
}
