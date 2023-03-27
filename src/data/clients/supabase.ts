import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/env.mjs";

export class Supabase {
  public client: SupabaseClient;

  constructor() {
    this.client = createClient(
      env.SUPABASE_PROJECT_URL,
      env.SUPABASE_PROJECT_KEY
    );
  }
}
