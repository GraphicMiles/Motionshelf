import fs from 'node:fs/promises';
import {run} from './core.mjs';
export async function cli(name,args=process.argv.slice(2)){
 if(args.includes('--help')||!args.length){console.log(`MotionShelf ${name}\nUsage: node ${name}.mjs input.json\nReads supplied JSON only; never executes submitted code.`);return}
 if(args.length!==1)throw Error('Provide one JSON input file.');
 const stats=await fs.stat(args[0]);if(!stats.isFile()||stats.size>1_000_000)throw Error('Input must be a JSON file under 1 MB.');
 const data=JSON.parse(await fs.readFile(args[0],'utf8'));
 console.log(JSON.stringify(run(name,data),null,2));
}
export async function execute(name){try{await cli(name)}catch(error){console.error(`Analysis failed: ${error.message}`);process.exitCode=1}}
