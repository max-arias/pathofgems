import pako from "/web_modules/pako-es.js";
export default (data) => {
  try {
    const parsedData = data.replace(/-/gim, "+").replace(/_/gim, "/");
    const decoded = atob(parsedData);
    const charData = decoded.split("").map((i) => i.charCodeAt(0));
    const binData = new Uint8Array(charData); // Pako magic

    const xmlStr = pako.inflate(binData, {
      to: "string",
    });
    const objStr = parser.parse(xmlStr, {
      ignoreAttributes: false,
      parseAttributeValue: true,
    });
    console.log("objStr", objStr);
    return {
      build: {
        className: objStr.PathOfBuilding.Build["@_className"],
        ascendancyName: objStr.PathOfBuilding.Build["@_ascendClassName"],
      },
      skills: objStr.PathOfBuilding.Skills.Skill.map((s) => {
        const gems = s.Gem.length
          ? s.Gem.map((g) => ({
              name: g["@_nameSpec"],
            }))
          : {
              name: s.Gem["@_nameSpec"],
            };
        return {
          name: s["@_label"],
          gems,
        };
      }),
    };
  } catch (err) {
    console.log("err", err);
  }

  return false;
};
