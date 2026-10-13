import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {rosary} from '../lib/rosary.mjs';

test('public counters, group weighting, legacy records, and owner-only anonymous intentions',async()=>{
 const original=process.cwd(),dir=await mkdtemp(path.join(tmpdir(),'chapel-offerings-'));
 process.chdir(dir);process.env.LOCAL_PREVIEW='1';process.env.SESSION_SECRET='test-session-secret-at-least-32-characters';process.env.OWNER_READ_TOKEN='different-owner-secret-at-least-32-characters';
 const {default:handler}=await import('../api/chapel.js');const store=await import('../lib/store.mjs');
 async function call(route,token,body){const res={statusCode:200,setHeader(){},end(value){this.data=JSON.parse(value);}};await handler({url:'/api/'+route,method:body===undefined?'GET':'POST',headers:{host:'localhost',authorization:token?'Bearer '+token:undefined},body},res);return {status:res.statusCode,data:res.data};}
 const id=t=>JSON.parse(Buffer.from(t.split('.')[0],'base64url')).id;
 try{
  const a=(await call('session',null,{mock:true})).data.token,b=(await call('session',null,{mock:true})).data.token,c=(await call('session',null,{mock:true})).data.token;
  let personal=(await call('personal',a,{})).data;
  assert.equal((await call('offering',a,{roomId:personal.id,text:'Too early'})).status,409);
  while(!personal.complete){const r=await call('respond',a,{roomId:personal.id,index:personal.index,response:personal.step.response});assert.equal(r.status,200);personal=r.data;}
  assert.equal(personal.offering.private,true);assert.equal(personal.offering.submitted,false);
  assert.equal((await call('offering',b,{roomId:personal.id,text:'Someone else'})).status,403);
  assert.equal((await call('offering',a,{roomId:personal.id,text:'  '})).status,422);
  assert.equal((await call('offering',a,{roomId:personal.id,text:'For peace in the world.'})).status,200);
  await call('offering',a,{roomId:personal.id,text:'A duplicate must not replace the original.'});
  assert.equal((await call('room?id='+personal.id,a)).data.offering.submitted,true);
  assert.equal((await call('offerings')).status,403);assert.equal((await call('offerings',a)).status,403);
  assert.deepEqual((await call('offerings',process.env.OWNER_READ_TOKEN)).data,{offerings:[{text:'For peace in the world.'}]});
  const saved=await store.read((await store.keys('offerings/'))[0]);assert.deepEqual(Object.keys(saved),['text']);
  const groupId='group-2026-10-12';await store.create(`rooms/${groupId}.json`,{id:groupId,date:'2026-10-12',type:'group',members:[id(a),id(b),id(c)],startedAt:new Date().toISOString()});
  await call('leave',c,{roomId:groupId});let group=(await call('room?id='+groupId,a)).data;
  while(!group.complete){const index=group.index;await call('respond',a,{roomId:groupId,index,response:group.step.response});group=(await call('respond',b,{roomId:groupId,index,response:group.step.response})).data;}
  assert.equal((await call('stats')).data.rosariesCompleted,3);
  await call('room?id='+groupId,a);assert.equal((await call('stats')).data.rosariesCompleted,3);
  await call('offering',a,{roomId:groupId,text:'For families.'});await call('offering',b,{roomId:groupId,text:'For those who are alone.'});
  assert.equal((await call('offerings',process.env.OWNER_READ_TOKEN)).data.offerings.length,3);
  await store.create('completed/personal-legacy.json',{id:'personal-legacy',type:'personal'});
  await store.create('rooms/group-legacy.json',{id:'group-legacy',date:'2026-10-12',type:'group',members:['legacy-a','legacy-b','legacy-c']});
  for(const member of ['legacy-a','legacy-b'])await store.create(`answers/group-legacy/${rosary('2026-10-12').length-1}-${member}.json`,{});
  await store.create('completed/group-legacy.json',{id:'group-legacy',type:'group'});
  assert.deepEqual((await call('stats')).data,{sessionsStarted:3,rosariesCompleted:6});
  const key=process.env.OWNER_READ_TOKEN;delete process.env.OWNER_READ_TOKEN;assert.equal((await call('offerings',key)).status,503);
 }finally{process.chdir(original);await rm(dir,{recursive:true,force:true});}
});
