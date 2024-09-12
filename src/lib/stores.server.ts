import ca_cert from "$lib/certificates/ca-certificate.crt?raw";
import { DB_CONN_STRING } from "$env/static/private";
import { readable } from "svelte/store";
import pg from "pg";

export const pg_pool_store = readable(new pg.Pool({
  connectionString: DB_CONN_STRING,
  ssl: {
    rejectUnauthorized: true,
    ca: ca_cert
  }
}));