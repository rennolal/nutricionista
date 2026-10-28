import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {handleConsultation} from '../supabase/functions/andrea-contacto/index.mjs';
const token='test_only_function_token_not_real_123456789';
const hash=createHash('sha256').update(token).digest('hex');
const values={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEYS:JSON.stringify({default:'sb_secret_fake_test_only'})};
const data={nombre:'Prueba',email:'prueba@example.com',telefono:'600000000',deporte:'Running',mensaje:''};
const req=(body=data,auth=token)=>new Request('https://example.supabase.co/functions/v1/andrea-contacto',{method:'POST',headers:{'x-form-token':auth,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('function blocks missing or incorrect authentication before database access',async()=>{
 for(const auth of ['', 'incorrect']){
  const result=await handleConsultation(req(data,auth),values,()=>{throw Error('must not contact database')},hash);
  assert.equal(result.status,401);
 }
});
test('function validates contact fields before database access',async()=>{
 const result=await handleConsultation(req({...data,email:'invalid'}),values,()=>{throw Error('must not contact database')},hash);
 assert.equal(result.status,400);
});
test('function inserts only permitted fields; ignores supplied date and id',async()=>{
 let called=false;
 const result=await handleConsultation(req({...data,fecha_envio:'2000-01-01',id:'attacker-chosen-id'}),values,async(url,options)=>{
  called=true;assert.equal(url,'https://example.supabase.co/rest/v1/consultas');
  assert.equal(options.headers.apikey,'sb_secret_fake_test_only');
  assert.equal(options.headers.Authorization,undefined);
  assert.deepEqual(JSON.parse(options.body),data);
  return new Response(null,{status:201});
 },hash);
 assert.ok(called);assert.equal(result.status,201);
});
test('function returns errors for failed database writes without exposing backend details',async()=>{
 const result=await handleConsultation(req(),values,async()=>new Response('sensitive database details',{status:403}),hash);
 assert.equal(result.status,502);assert.doesNotMatch(await result.text(),/sensitive/);
});
