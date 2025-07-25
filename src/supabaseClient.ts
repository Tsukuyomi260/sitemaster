import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msqoftkkbxfvptbovqxw.supabase.co'; // Remplace par ton URL Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcW9mdGtrYnhmdnB0Ym92cXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjU5MjMsImV4cCI6MjA2OTA0MTkyM30.BMjBzB8txvEeUlBB3PatKDtIXBDMBfiH4tjWIpu1XwM';        // Remplace par ta clé anonyme

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
