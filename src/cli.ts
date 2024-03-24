import fs from "fs";
import { argv } from "node:process";
import { buildIdealObject, sumDeepKeys } from "./index";

console.log(`[estimate-schema] reading ${argv[2]}`);

const content = fs.readFileSync(argv[2], "utf-8");
const data = JSON.parse(content);

console.log("data.len", data.length);

console.log("first one:", data[0]);

const idealObj = buildIdealObject(sumDeepKeys(data));
console.log({ idealObj });
console.log("------");
console.log(JSON.stringify(idealObj));
