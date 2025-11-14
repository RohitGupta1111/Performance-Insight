import { zip } from "zip-a-folder";
import { readFileSync } from "fs";


async function main() {
  const manifestJson = JSON.parse(readFileSync("./public/manifest.json", "utf8"));
  await zip("dist",`${manifestJson.name}_${manifestJson.version}.zip`);
  console.log("Extension zipped successfully!");
}

main();
