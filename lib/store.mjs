import {mkdir, readFile, writeFile, readdir} from 'node:fs/promises';
import path from 'node:path';
const local = process.env.LOCAL_PREVIEW === '1' && !process.env.VERCEL;
const root = path.resolve('.local-data');
export async function read(key) {
 if(local) { try {return JSON.parse(await readFile(path.join(root,key),'utf8'));} catch(e) {if(e.code==='ENOENT')return null; throw e;} }
 const {get} = await import('@vercel/blob'); const result = await get(key,{access:'private',useCache:false});
 if(!result) return null; return JSON.parse(await new Response(result.stream).text());
}
export async function create(key,value) {
 if(local) { await mkdir(path.dirname(path.join(root,key)),{recursive:true}); try {await writeFile(path.join(root,key),JSON.stringify(value),{flag:'wx'});return true;}catch(e){if(e.code==='EEXIST')return false;throw e;} }
 const {put} = await import('@vercel/blob');
 try {await put(key,JSON.stringify(value),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});return true;} catch(e){if(await read(key))return false;throw e;}
}
export async function keys(prefix) {
 if(local) {async function walk(dir) {let entries;try{entries=await readdir(dir,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')return [];throw e;}return (await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.relative(root,path.join(dir,e.name)).replaceAll('\\','/')))).flat();}return (await walk(root)).filter(k=>k.startsWith(prefix)).sort();}
 const {list}=await import('@vercel/blob');let cursor;const all=[];do{const page=await list({prefix,cursor,limit:1000});all.push(...page.blobs.map(b=>b.pathname));cursor=page.hasMore?page.cursor:undefined;}while(cursor);return all.sort();
}
