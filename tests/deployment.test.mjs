import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import handler from '../api/chapel.js';

test('production config starts in Node without browser globals or storage secrets',async()=>{
 assert.equal(typeof location,'undefined');
 const headers={};let output;
 const res={setHeader:(key,value)=>headers[key]=value,end:value=>{output=value;}};
 await handler({url:'/api/chapel?route=config',method:'GET',headers:{host:'chapel.example'}},res);
 assert.equal(res.statusCode,undefined);
 assert.deepEqual(JSON.parse(output),{localPreview:false});
});

test('Vercel uses static assets and only the dedicated API entry',async()=>{
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
 assert.equal(config.framework,null);
 assert.equal(config.outputDirectory,'public');
 assert.deepEqual(Object.keys(config.functions),['api/chapel.js']);
 const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
 assert.ok(html.includes('src="/chapel-client.js"'));
 const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
 assert.equal(pkg.scripts.dev,'node scripts/local-preview.mjs');
});
