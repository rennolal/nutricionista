import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('../public/nutrition-bowl.jpg.base64',import.meta.url));
const target=fileURLToPath(new URL('../public/nutrition-bowl.jpg',import.meta.url));
if(existsSync(source)) writeFileSync(target,Buffer.from(readFileSync(source,'utf8').trim(),'base64'));
