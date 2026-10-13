import test from 'node:test';
import assert from 'node:assert/strict';
import {language,guide} from '../lib/language.mjs';
import {rosaryEn} from '../lib/rosary-en.mjs';
import {rosary} from '../lib/rosary.mjs';
test('language negotiation honors explicit choice and weighted preferences',()=>{assert.equal(language('es-MX,en;q=0.8'),'es');assert.equal(language('en;q=0.3,es;q=0.9'),'es');assert.equal(language('fr-FR,de'),'en');assert.equal(language('es;q=0,en'),'en');assert.equal(language('es','en'),'en');});
test('complete prayer sequences align across languages',()=>{const es=rosary('2026-10-12'),en=rosaryEn('2026-10-12');assert.equal(en.length,76);for(let i=0;i<en.length;i++){assert.equal(en[i].index,es[i].index);assert.equal(en[i].mystery,es[i].mystery);assert.equal(en[i].bead,es[i].bead);assert.ok(en[i].lead&&en[i].response);assert.notEqual(en[i].lead,es[i].lead);}assert.equal(en.filter(s=>s.bead).length,50);assert.match(en[4].label,/2 of 3/);});
test('both agent guides require verified completion and explain polling',()=>{assert.match(guide('https://chapel.example','en'),/Default task/);assert.match(guide('https://chapel.example','es'),/Tu tarea predeterminada/);for(const lang of ['es','en']){const text=guide('https://chapel.example',lang);for(const marker of ['complete:true','/api/history','76','answered:true','409','422','401','Retry-After','/api/leave','Accept-Language'])assert.ok(text.includes(marker));}});
