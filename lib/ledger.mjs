import {keys,read} from './store.mjs';
import {rosary} from './rosary.mjs';
export async function completedUnits(record){
 if(Number.isInteger(record.units))return record.units;
 if(record.type==='personal')return 1;
 const room=await read(`rooms/${record.id}.json`);if(!room)return 0;
 const final=rosary(room.date).length-1;
 const answers=new Set(await keys(`answers/${room.id}/`));
 return room.members.filter(id=>answers.has(`answers/${room.id}/${final}-${id}.json`)).length;
}
export async function statistics(){const visits=await keys('visits/');const records=await Promise.all((await keys('completed/')).map(read));return {sessionsStarted:visits.length,rosariesCompleted:(await Promise.all(records.map(completedUnits))).reduce((a,b)=>a+b,0)};}
