const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w\-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    envVars[match[1]] = match[2].trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: users, error: usersErr } = await supabase.from('users').select('*').limit(1);
  if (usersErr || users.length === 0) {
    console.log("No users found in DB or error:", usersErr?.message);
  } else {
    console.log("USERS_KEYS:", Object.keys(users[0]));
    console.log("USER_ROW:", users[0]);
  }
}

check();
