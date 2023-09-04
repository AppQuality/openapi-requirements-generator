#! /usr/bin/env node
import fs from "fs";
import yargs from "yargs";
import generate from "..";

let OPTIONS = yargs
  .usage("\nUsage: -u UrlToTheReference")
  .strict()
  .option("u", {
    alias: "url",
    describe: "Pass -u to set the url",
    type: "string",
    requiresArg: true,
    required: true,
  });

async function setOptions() {
  OPTIONS.check((argv) => {
    if (!argv.u)
      throw Error(`Please provide url with -u 
[Missing required property -u]`);
    return true;
  });

  return OPTIONS.argv;
}

async function run() {
  const options = await setOptions();

  await generate({ url: options.u }).then((examples) => {
    const basePath = "./cypress/fixtures";
    if (fs.existsSync(basePath)) fs.rmSync(basePath, { recursive: true });
    for (const key in examples) {
      const example = examples[key];
      const path = `${basePath}${example.path.replace(
        /[{}]/g,
        ""
      )}/_${example.method.toLocaleLowerCase()}`;
      fs.mkdirSync(path, { recursive: true });
      fs.writeFileSync(
        `${path}/${example.code}_${example.exampleName.replace(
          / /g,
          "_"
        )}.json`,
        JSON.stringify(example.content, null, 2)
      );
    }
  });
}

run();
