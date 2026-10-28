declare namespace Cloudflare {
  interface Env {
    SUPABASE_URL?: string;
    SUPABASE_FORM_TOKEN?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
