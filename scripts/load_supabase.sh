#!/usr/bin/env bash

# Loads schema and seed data into a Supabase database
psql "$SUPABASE_DB_URL" < Database/postgres.sql
if [ -f Database/seed.sql ]; then
  psql "$SUPABASE_DB_URL" < Database/seed.sql
fi
