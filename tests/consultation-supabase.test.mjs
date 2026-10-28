import test from 'node:test';
import assert from 'node:assert/strict';
import {getSupabaseConfig,saveSupabaseConsultation} from '../lib/consultation-supabase.ts';
const config={url:'https://example.supabase.co',secretKey:'sb_secret_test_only_not_a_real_key'};
const data={name:'Prueba técnica',email:'prueba@example.com',phone:'600000000',sport:'Running',message:''};

test('only completely missing configuration uses the existing storage',()=>{
  assert.equal(getSupabaseConfig({}),null);
  assert.throws(()=>getSupabaseConfig({SUPABASE_URL:config.url}));
  assert.throws(()=>getSupabaseConfig({SUPABASE_SECRET_KEY:config.secretKey}));
});
test('configuration rejects non-HTTPS, browser keys and URLs with credentials or paths',()=>{
 for(const url of ['http://example.supabase.co','https://user:password@example.supabase.co','https://example.supabase.co/unexpected','https://example.supabase.co?key=foo'])assert.throws(()=>getSupabaseConfig({SUPABASE_URL:url,SUPABASE_SECRET_KEY:config.secretKey}));
 assert.throws(()=>getSupabaseConfig({SUPABASE_URL:config.url,SUPABASE_SECRET_KEY:'sb_publishable_test'}));
 assert.deepEqual(getSupabaseConfig({SUPABASE_URL:config.url+'/',SUPABASE_SECRET_KEY:config.secretKey}),config);
});
test('inserts the Spanish fields, with server authentication and database-generated date',async()=>{
 let called=false;
 await saveSupabaseConsultation(config,data,async(url,options)=>{
  called=true;
  assert.equal(url,config.url+'/rest/v1/consultas');
  assert.equal(options.method,'POST');
  assert.equal(options.headers.apikey,config.secretKey);
  assert.equal(options.headers.Prefer,'return=minimal');
  assert.equal(options.redirect,'error');
  assert.ok(options.signal instanceof AbortSignal);
  assert.deepEqual(JSON.parse(options.body),{nombre:data.name,email:data.email,telefono:data.phone,deporte:data.sport,mensaje:''});
  return new Response(null,{status:201});
 });
 assert.ok(called);
});
test('database rejection and network errors never produce false success',async()=>{
 await assert.rejects(saveSupabaseConsultation(config,data,async()=>new Response('private backend detail',{status:403})),error=>error.message==='Supabase did not confirm the insert');
 await assert.rejects(saveSupabaseConsultation(config,data,async()=>{throw new Error('network unavailable')}));
});
