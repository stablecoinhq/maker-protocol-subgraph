const fs = require("fs-extra");
const mustache = require("mustache");


/**
 * copied from https://github.com/protofire/omen-subgraph/blob/master/render-templates.js
 */
const main = () => {
  const args = process.argv.slice(2);
  const network = ["goerli", "mainnet"].includes(args[0]) ? args[0] : "mainnet"
  const networksData = require("./networks.json")
  const templateData = { network }
  for (const key of Object.keys(networksData)) {
    templateData[key] = networksData[key][network]
  }

  for (const templatedFileDesc of [
    ["subgraph", "yaml"],
  ]) {
    const template = fs
      .readFileSync(
        `${templatedFileDesc[0]}.template.${templatedFileDesc[1]}`
      )
      .toString();
    fs.writeFileSync(
      `${templatedFileDesc[0]}.${templatedFileDesc[1]}`,
      mustache.render(template, templateData)
    );
  }
};

main();