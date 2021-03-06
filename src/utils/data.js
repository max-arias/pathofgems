import pako from 'pako-es'

import { corsProxyUrl } from './constants.js'

export const decode = (data) => {
  try {
    // Parse PoB data
    const parsedData = data.replace(/-/gim, '+').replace(/_/gim, '/')

    //base64 decode
    const decoded = atob(parsedData)

    //Convert to bit array
    const charData = decoded.split('').map((i) => i.charCodeAt(0))
    const binData = new Uint8Array(charData)

    // Inflate
    const xmlStr = pako.inflate(binData, { to: 'string' })

    // Convert to JSON
    const objStr = parser.parse(xmlStr, {
      ignoreAttributes: false,
      parseAttributeValue: true,
    })

    const skills = Array.isArray(objStr.PathOfBuilding.Skills.Skill) ? objStr.PathOfBuilding.Skills.Skill : [objStr.PathOfBuilding.Skills.Skill]

    // Pull the data we need
    return {
      build: {
        className: objStr.PathOfBuilding.Build['@_className'],
        ascendancyName: objStr.PathOfBuilding.Build['@_ascendClassName'],
      },
      skills: skills.filter(
        (s) => s['@_mainActiveSkill'] === 1 && !s['@_source']
      ).map((s) => {
        let gems = s.Gem.length
          ? s.Gem.map((g) => ({
              name: g['@_nameSpec'],
              id: g['@_gemId'],
              skillId: g['@_skillId'],
              checked: false,
              skillSlot: s['@_slot'] || '',
              skillLabel: s['@_label'] || ''
            }))
          : [
              {
                name: s.Gem['@_nameSpec'],
                id: s.Gem['@_gemId'],
                skillId: s.Gem['@_skillId'],
                checked: false,
                slot: s['@_slot'] || '',
                skillLabel: s['@_label'] || ''
              },
            ]

        return {
          name: s['@_label'],
          gems,
        }
      }),
    }
  } catch (err) {
    console.log('err', err)
  }

  return false
}

const findVendorReward = (gem, vendorData, questData, buildClass) => {
  const reward = []

  Object.keys(vendorData).map((key) => {
    if (vendorData[key].rewards[gem.id]) {
      // If the item is a reward for our class
      if (
        vendorData[key].rewards[gem.id] &&
        vendorData[key].rewards[gem.id].classes.includes(buildClass)
      ) {
        const questId = vendorData[key].rewards[gem.id].quest_id

        // Push the act number, quest name and vendor name
        reward.push({
          act: vendorData[key].act,
          vendorName: vendorData[key].name,
          ...(questData[questId] && { questName: questData[questId].name }),
        })
      }
    }
  })

  if (!reward.length) {
    return false
  }

  return reward
}

const findQuestReward = (gem, questData, buildClass) => {
  const reward = []

  Object.keys(questData).map((key) => {
    if (questData[key].rewards[gem.id]) {
      // If the item is a reward for our class
      if (
        questData[key].rewards[gem.id] &&
        questData[key].rewards[gem.id].classes.includes(buildClass)
      ) {
        reward.push({ act: questData[key].act, questName: questData[key].name })
      }
    }
  })

  if (!reward.length) {
    return false
  }

  return reward
}

export const hydrateBuildData = (
  decodedBuildData,
  gemData,
  vendorData,
  questData
) => {
  const parsedData = {}

  const buildClass = decodedBuildData.build.className

  for (let i = 0; i < decodedBuildData.skills.length; i++) {
    const item = decodedBuildData.skills[i]

    if (item.gems && item.gems.length) {
      for (let j = 0; j < item.gems.length; j++) {
        const skillId = item.gems[j].skillId

        if (gemData[skillId]) {
          let minRequiredLevel = '-'
          if (gemData[skillId].per_level['1'] && gemData[skillId].per_level['1'].required_level) {
            minRequiredLevel = gemData[skillId].per_level['1'].required_level
          }

          if (!parsedData[minRequiredLevel]) {
            parsedData[minRequiredLevel] = []
          }

          if (!parsedData[minRequiredLevel].find(e => e.skillId === skillId)) {
            const questReward = findQuestReward(
              item.gems[j],
              questData,
              buildClass
            )
            const vendorReward = findVendorReward(
              item.gems[j],
              vendorData,
              questData,
              buildClass
            )

            const out = {
              ...item.gems[j],
              name: gemData[skillId].base_item.display_name,
              ...(questReward && { questReward }),
              ...(vendorReward && { vendorReward }),
            }

            parsedData[minRequiredLevel].push(out)
          }
        }
      }
    }
  }

  return parsedData
}

export const store = (url, build, data) => {
  const unCorsUrl = url.replace(corsProxyUrl, '').replace('raw/', '')
  localStorage.setItem(
    unCorsUrl,
    JSON.stringify({
      build: build.build,
      data,
    })
  )
}

export const toggleGem = (url, data, skillId) => {
  const unCorsUrl = url.replace(corsProxyUrl, '').replace('raw/', '')

  const updatedData = Object.keys(data).reduce((acc, lvl) => {
    const lvlData = data[lvl].map(skill => {
      return {
        ...skill,
        checked: (skill.skillId === skillId) ? !skill.checked: skill.checked
      }
    })

    return {
      ...acc,
      [lvl]: lvlData
    }
  }, {})

  let localStorageData = localStorage.getItem(unCorsUrl)
  localStorageData = JSON.parse(localStorageData)

  localStorageData.data = updatedData

  localStorage.setItem(unCorsUrl, JSON.stringify(localStorageData))
  return updatedData
}

export const getStorageData = (url) => {
  const unCorsUrl = url.replace(corsProxyUrl, '').replace('raw/', '')

  const localStorageData = localStorage.getItem(unCorsUrl)
  return JSON.parse(localStorageData)
}

export const previousBuilds = () => {
  return Object.keys(localStorage).reduce((acc, item) => {
    return {
      ...acc,
      [item]: JSON.parse(localStorage.getItem(item)),
    }
  }, {})
}