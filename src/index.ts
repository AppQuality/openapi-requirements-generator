import OpenAPIParser from "@readme/openapi-parser";

async function generate({ url }: { url: string }) {
  const parser = new OpenAPIParser();

  const api = await parser.dereference(url);

  const paths = api.paths;

  const exampleList: {
    [key: string]: {
      code: string;
      method: string;
      path: string;
      exampleName: string;
      content: any;
    };
  } = {};

  for (const path in paths) {
    const { parameters, ...methods } = paths[path];
    for (const method in methods) {
      const responses = methods[method].responses;
      for (const response in responses) {
        const content = responses[response].content;
        if (content) {
          const json = content["application/json"];
          if (json) {
            const examples = json.examples;
            if (examples) {
              for (const key in examples) {
                const example = examples[key];
                if (example) {
                  const value = example.value;
                  if (value) {
                    const name = `${response}_${method}${path
                      .replace(/\//g, "_")
                      .replace(/[{}]/g, "")}_${key}`;
                    exampleList[name] = {
                      code: response,
                      method: method.toLocaleUpperCase(),
                      path,
                      exampleName: key,
                      content: value,
                    };
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return exampleList;
}

export default generate;
