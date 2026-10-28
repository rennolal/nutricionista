declare namespace Cloudflare {
  interface Env {
    SUPABASE_URL?: string;
    SUPABASE_SECRET_KEY?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
