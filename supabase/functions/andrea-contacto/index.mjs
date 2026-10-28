// Server-to-server authentication: only the SHA-256 hash is tracked in source.
const EXPECTED_TOKEN_HASH = 'f7259eec29d25eadd1917f22b48105542c413899189b5d1f9b65fa888948cf19';
const json = (data, status) => Response.json(data, {status, headers:{'Cache-Control':'no-store'}});

export async function handleConsultation(request, values, transport = fetch, expectedHash = EXPECTED_TOKEN_HASH) {
  if (request.method !== 'POST') return json({error:'Método no permitido'},405);
  const token=request.headers.get('x-form-token') || '';
  if (!token || token.length > 256) return json({error:'No autorizado'},401);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  const hash=Array.from(new Uint8Array(digest), b=>b.toString(16).padStart(2,'0')).join('');
  if (hash !== expectedHash) return json({error:'No autorizado'},401);
  try {
    if (!request.headers.get('content-type')?.includes('application/json')) return json({error:'Formato no válido'},415);
    const body=await request.text();
    if (new TextEncoder().encode(body).length > 12000) return json({error:'Solicitud demasiado grande'},413);
    const raw=JSON.parse(body);
    if (!raw || typeof raw!=='object' || Array.isArray(raw)) return json({error:'Datos no válidos'},400);
    const limits={nombre:100,email:254,telefono:30,deporte:120,mensaje:3000};
    const data={};
    for (const [key,max] of Object.entries(limits)) {
      if (raw[key] !== undefined && typeof raw[key] !== 'string') return json({error:'Datos no válidos'},400);
      data[key]=(raw[key] || '').trim();
      if (data[key].length>max) return json({error:'Campo demasiado largo'},400);
    }
    if (!data.nombre || !data.deporte || !/^\S+@\S+\.\S+$/.test(data.email) || !/^\+?[\d\s().-]{7,30}$/.test(data.telefono)) return json({error:'Revisa los datos'},400);
    const modern=JSON.parse(values.SUPABASE_SECRET_KEYS || '{}');
    const secret=modern.default || values.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret || !values.SUPABASE_URL) return json({error:'Servicio no disponible'},503);
    const headers={apikey:secret,'Content-Type':'application/json',Prefer:'return=minimal'};
    if (!secret.startsWith('sb_secret_')) headers.Authorization=`Bearer ${secret}`;
    const result=await transport(`${values.SUPABASE_URL.replace(/\/$/,'')}/rest/v1/consultas`,{
      method:'POST',headers,body:JSON.stringify(data),redirect:'error',signal:AbortSignal.timeout(10000)
    });
    if (!result.ok) return json({error:'No se ha podido guardar la consulta'},502);
    return json({ok:true},201);
  } catch { return json({error:'No se ha podido guardar la consulta'},500); }
}

if (typeof Deno !== 'undefined') {
  Deno.serve(request=>handleConsultation(request,{
    SUPABASE_URL:Deno.env.get('SUPABASE_URL'),
    SUPABASE_SECRET_KEYS:Deno.env.get('SUPABASE_SECRET_KEYS'),
    SUPABASE_SERVICE_ROLE_KEY:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  }));
}
