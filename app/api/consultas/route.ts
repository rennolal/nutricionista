import {env} from "cloudflare:workers";
import {getSupabaseConfig, saveSupabaseConsultation} from "../../../lib/consultation-supabase";
import {getDb} from '../../../db';
import {consultations} from '../../../db/schema';
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin && origin!==new URL(request.url).origin) return Response.json({error:'Origen no permitido'},{status:403});
 if(Number(request.headers.get('content-length')||0)>12000)return Response.json({error:'Solicitud demasiado grande'},{status:413});
 try{const raw=await request.json();
 if(!raw || typeof raw!=='object' || Array.isArray(raw))return Response.json({error:'Datos no válidos'},{status:400});
 const data=raw as Record<string,unknown>;
 if(data.website)return Response.json({ok:true});
 const limits:Record<string,number>={name:100,email:254,phone:30,sport:120,message:3000};
 const clean:Record<string,string>={};for(const[key,max]of Object.entries(limits)){if(data[key]!==undefined && typeof data[key]!=='string')return Response.json({error:'Datos no válidos'},{status:400});clean[key]=typeof data[key]==='string'?(data[key] as string).trim():'';if(clean[key].length>max)return Response.json({error:'Campo demasiado largo'},{status:400})}
 if(!clean.name||!clean.sport||!/^\S+@\S+\.\S+$/.test(clean.email)||!/^\+?[\d\s().-]{7,30}$/.test(clean.phone)||data.consent!=='on')return Response.json({error:'Revisa los campos obligatorios'},{status:400});
 const supabase = getSupabaseConfig(env);
 if (supabase) {
   await saveSupabaseConsultation(supabase, {name:clean.name,email:clean.email,phone:clean.phone,sport:clean.sport,message:clean.message});
 } else {
   // Preserve the current live form until the Supabase connection is configured.
   const now=new Date().toISOString();
   await getDb().insert(consultations).values({id:crypto.randomUUID(),name:clean.name,email:clean.email,phone:clean.phone,sport:clean.sport,message:clean.message,consentAt:now,createdAt:now});
 }
 return Response.json({ok:true},{status:201});
 }catch(error){console.error('contact_submission_failed', {name: error instanceof Error ? error.name : 'unknown'});return Response.json({error:'No se ha podido guardar la solicitud'},{status:500})}
}
