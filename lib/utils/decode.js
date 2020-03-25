import pako from "/web_modules/pako-es.js";
export default (data => {
  try {
    // Parse PoB data
    const parsedData = data.replace(/-/gim, '+').replace(/_/gim, '/'); //base64 decode

    const decoded = atob(parsedData); //Convert to bit array

    const charData = decoded.split('').map(i => i.charCodeAt(0));
    const binData = new Uint8Array(charData); // Inflate

    const xmlStr = pako.inflate(binData, {
      to: 'string'
    }); // Convert to JSON

    const objStr = parser.parse(xmlStr, {
      ignoreAttributes: false,
      parseAttributeValue: true
    }); // Pull the data we need

    return {
      build: {
        className: objStr.PathOfBuilding.Build['@_className'],
        ascendancyName: objStr.PathOfBuilding.Build['@_ascendClassName']
      },
      skills: objStr.PathOfBuilding.Skills.Skill.map(s => {
        const gems = s.Gem.length ? s.Gem.map(g => ({
          name: g['@_nameSpec'],
          id: g['@_gemId'],
          skillId: g['@_skillId']
        })) : [{
          name: s.Gem['@_nameSpec'],
          id: s.Gem['@_gemId'],
          skillId: s.Gem['@_skillId']
        }];
        return {
          name: s['@_label'],
          gems
        };
      })
    };
  } catch (err) {
    console.log('err', err);
  }

  return false;
});