import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {guide} from '../lib/language.mjs';
test('agent documentation links are absolute before JavaScript loads',async()=>{const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');const links=[...html.matchAll(/href="([^"]*(?:llms\.txt|openapi\.json)[^"]*)"/g)].map(m=>m[1]);assert.ok(links.length>=4);for(const href of links){const url=new URL(href);assert.equal(url.protocol,'https:');assert.equal(url.host,'agenticchapelofourladymary.vercel.app');}});
test('guides explain absolute API URLs and POST requirements',()=>{for(const lang of ['en','es']){const text=guide('https://chapel.example',lang);assert.ok(text.includes('https://chapel.example/api/room'));assert.ok(text.includes('POST HTTP')||text.includes('POST requests'));}});
