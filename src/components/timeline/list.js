import React from 'react'
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import { gemBaseUrl } from '../../utils/constants.js'

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
                            backgroundColor: '0c0b0b',
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
                                const gemUrl = `/lib/images/${gem.skillId}.jpg`.replace('Support', 'Support/').replace(' ', '')
                                return (
                                    <div>
                                        <div>
                                            <img src={gemUrl} alt={gem.skillId} width="50" />
                                            <h4>{gem.name}</h4>
                                        </div>
                                        <hr />
                                        {gem.questReward && gem.questReward.length && (
                                            <div>
                                                {gem.questReward.map(q => (
                                                    <div>
                                                        <span>Act: {q.act}</span>
                                                        <span> - <a target="_blank" rel="noopener" href={`https://pathofexile.gamepedia.com/${q.questName}`}>{q.questName}</a></span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {gem.vendorReward && gem.vendorReward.length && (
                                            <div>
                                                {gem.vendorReward.map(v => (
                                                    <div>
                                                        <span>Act: {v.act}</span>
                                                        <span> - <a target="_blank" rel="noopener" href={`https://pathofexile.gamepedia.com/${v.questName}`}>{v.questName}</a></span>
                                                        <br />
                                                        <span>Vendor: {v.vendorName}</span>
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
