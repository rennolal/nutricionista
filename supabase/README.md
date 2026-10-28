# Formulario de Andrea Nutrition → Supabase

## Estado de activación

El código está preparado. La tabla todavía debe crearse en el proyecto Supabase seleccionado y deben configurarse las dos variables de servidor. Mientras ambas están ausentes, el formulario mantiene el almacenamiento D1 existente. No se ha realizado una conexión ni una inserción real en Supabase.

Cuando se configuran ambas variables, cada nueva solicitud se envía exclusivamente a `public.consultas`. Una configuración incompleta o un error de Supabase devuelve un error al formulario: nunca se confirma un envío fallido ni se cambia silenciosamente a D1.

## Crear la tabla

Aplica `migrations/202610280001_create_consultas.sql` una sola vez en el proyecto elegido. La migración crea una tabla nueva; si ya existe una tabla `consultas`, revisa su estructura antes de adaptar la migración. No elimina ni modifica datos anteriores.

| Campo | Tipo | Origen |
| --- | --- | --- |
| nombre | text | Nombre obligatorio |
| email | text | Email obligatorio |
| telefono | text | Teléfono obligatorio |
| deporte | text | Deporte obligatorio |
| mensaje | text | Mensaje opcional; vacío si no se rellena |
| fecha_envio | timestamptz | PostgreSQL, `now()` |

La tabla también tiene una clave primaria `id` UUID. La fecha se guarda como instante con zona horaria; puede mostrarse en Europe/Madrid al consultarla.

## Configuración de servidor

Configura en el alojamiento, fuera del repositorio:

- `SUPABASE_URL`: URL HTTPS del proyecto, sin rutas adicionales.
- `SUPABASE_SECRET_KEY`: clave secreta `sb_secret_…`, marcada como secreto.

Para pruebas locales, usa un archivo `.dev.vars` ignorado por Git. No pegues claves en el código, en el chat ni en variables `NEXT_PUBLIC_*`. Las claves se leen únicamente en `app/api/consultas/route.ts`. Tras cambiar las variables del alojamiento, despliega de nuevo.

Se usa la API REST de Supabase, sin dependencias adicionales. RLS queda activado y los roles `anon` y `authenticated` no tienen acceso a la tabla. Las solicitudes pasan por la validación del servidor de la landing. El cliente solo recibe confirmación después de una respuesta satisfactoria de la base de datos.

## Verificación

Ejecuta `node --experimental-strip-types --test tests/consultation-supabase.test.mjs` y `pnpm build`. Los tests usan un transporte simulado y datos ficticios: no prueban la conexión remota. Para finalizar la activación, envía una solicitud de prueba en la landing y verifica su fila en Table Editor de Supabase.

No se migran automáticamente las solicitudes existentes de D1 ni se envían notificaciones por email.

Referencias oficiales:
- https://supabase.com/docs/guides/api
- https://supabase.com/docs/guides/getting-started/api-keys
