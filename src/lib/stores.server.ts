import ca_cert from "$lib/certificates/ca-certificate.crt?raw";
import { DB_CONN_STRING, STORAGE_ACCESS_KEY, STORAGE_ENDPOINT, STORAGE_SECRET } from "$env/static/private";
import { get, readable } from "svelte/store";
import pg from "pg";
import { S3 } from "@aws-sdk/client-s3";

export const pg_pool_store = readable(new pg.Pool({
  connectionString: DB_CONN_STRING,
  ssl: {
    rejectUnauthorized: true,
    ca: ca_cert
  }
}));

export const s3_store = readable(new S3({
  endpoint: STORAGE_ENDPOINT,
  region: "sgp1",
  credentials: {
    accessKeyId: STORAGE_ACCESS_KEY,
    secretAccessKey: STORAGE_SECRET
  }
}));