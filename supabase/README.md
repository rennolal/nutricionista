# Formulario de Andrea Nutrition → Supabase

## Proyecto y región

- Proyecto: `andrea-nutrition` (`nnuzvajmgnhijsryspbz`).
- Organización: `rennolal's Org`.
- Base de datos: París, Europa (`eu-west-3`).
- El formulario puede usarse desde Europa y LATAM; ambas regiones escriben en la misma base de datos europea. No se ha creado una segunda base de datos ni una réplica en LATAM.

## Flujo de envío

El navegador envía el formulario a `/api/consultas` en la landing. El servidor valida los campos y el consentimiento y llama a la Edge Function `andrea-contacto` de Supabase. La función autentica la llamada con `x-form-token`, vuelve a validar los datos e inserta exclusivamente los campos permitidos en `public.consultas`. PostgreSQL genera el identificador y la fecha.

| Campo | Tipo | Origen |
| --- | --- | --- |
| nombre | text | Nombre obligatorio |
| email | text | Email obligatorio |
| telefono | text | Teléfono obligatorio |
| deporte | text | Deporte obligatorio |
| mensaje | text | Opcional; vacío si no se rellena |
| fecha_envio | timestamptz | PostgreSQL, `now()` |

La tabla también tiene una clave primaria `id` UUID. La fecha representa un instante con zona horaria y puede mostrarse en la zona local del lector.

## Acceso y configuración

RLS está activado y los roles `anon` y `authenticated` no tienen acceso a las consultas. La función usa las credenciales internas de Supabase; la landing no recibe ninguna clave administrativa de la base de datos.

El alojamiento configura únicamente estas variables de servidor:

- `SUPABASE_URL`: URL HTTPS del proyecto.
- `SUPABASE_FORM_TOKEN`: token exclusivo de la función, guardado como secreto.

La función conserva únicamente la huella SHA-256 del token en el código. `verify_jwt = false` permite su autenticación propia, que rechaza solicitudes sin token válido. El token no se envía al navegador ni se incluye en GitHub. Para rotarlo, genera uno nuevo, actualiza la huella en la función y el secreto del alojamiento y vuelve a desplegar ambos.

`migrations/202610280001_create_consultas.sql` documenta la estructura aplicada en Supabase como `create_consultas`. No vuelvas a ejecutar la creación de la tabla sobre el proyecto existente. `config.toml` documenta la función desplegada y su proyecto.

Cuando ambas variables están ausentes, se conserva D1 para desarrollo o para una instalación sin configurar. Con Supabase configurado, las nuevas solicitudes se guardan exclusivamente en Supabase. Un fallo remoto devuelve un error y no confirma falsamente el envío ni cambia a D1.

## Pruebas

Ejecuta `node --experimental-strip-types --test tests/consultation-*.test.mjs` y `pnpm build`.

Los tests locales usan datos ficticios y un transporte simulado. La activación se verifica también con una solicitud real a la web publicada y una consulta a la tabla. No se migran automáticamente las consultas antiguas de D1 ni se envían notificaciones por email.

Referencias oficiales:
- https://supabase.com/docs/guides/api
- https://supabase.com/docs/guides/functions/secrets
- https://supabase.com/docs/guides/functions/function-configuration
