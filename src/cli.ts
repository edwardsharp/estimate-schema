import fs from "fs";
import { argv } from "node:process";
import { buildIdealObject, sumDeepKeys } from "./index";

console.log(`[estimate-schema] reading ${argv[2]}`);

const content = fs.readFileSync(argv[2], "utf-8");
const allAssets = JSON.parse(content).data.data;

console.log("allAssets.len", allAssets.length);

console.log("first one:", allAssets[0]);

const idealObj = buildIdealObject(sumDeepKeys(allAssets));
console.log({ idealObj });
console.log("------");
console.log(JSON.stringify(idealObj));
