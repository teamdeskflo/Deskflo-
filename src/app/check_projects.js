const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  }
});

async function run() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://nzcqkfdkfhmqjiyrlpmo.supabase.co';
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  const adminClient = createClient(supabaseUrl, serviceKey);

  // 1. Get the first user and their clients
  const { data: users, error: userErr } = await adminClient.from('users').select('*').limit(1);
  if (userErr || !users || users.length === 0) {
    console.error("Error fetching test user:", userErr || "No users in DB");
    return;
  }

  const testUser = users[0];
  console.log("Using test user for RLS testing:", testUser.email, "ID:", testUser.id);

  // 2. Fetch clients belonging to this test user
  const { data: clients, error: clientErr } = await adminClient
    .from('clients')
    .select('*')
    .eq('freelancer_id', testUser.id)
    .limit(1);

  if (clientErr || !clients || clients.length === 0) {
    console.error("No clients found for test user:", clientErr || "0 clients");
    return;
  }

  const testClient = clients[0];
  console.log("Using test client:", testClient.name, "ID:", testClient.id);

  // 3. Create a client authenticated as this user using claims or session
  // Since we don't have user's plaintext password, we can sign in using admin.generateLink or similar,
  // or we can test by creating a temporary token, OR we can check if the projects table allows inserts.
  // Wait, let's try a direct insert as the authenticated user using service role but acting as the user!
  // In Supabase, we can check RLS by using the supabase client authenticated with the user's token!
  // Let's create an auth link to get a session!
  const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: testUser.email
  });

  if (linkErr) {
    console.error("Error generating link:", linkErr);
    return;
  }

  // Sign in using the magic link hash/properties
  const userClient = createClient(supabaseUrl, anonKey);
  const { data: authData, error: authErr } = await userClient.auth.signInWithOtp({
    email: testUser.email
  });

  console.log("Sign in with OTP triggered. Let's try inserting with service_role first but using direct check.");
  
  // Wait! Let's check what exactly fails in the route.
  // Let's print the projects RLS status.
  // Let's test inserting a project directly using a custom client with authentication headers of this user!
  // Supabase lets us bypass auth in node by passing custom headers:
  const rlsClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${testUser.id}` // Wait, this needs a real JWT.
      }
    }
  });

  // Let's run a test query to find if we can insert projects directly.
  // Let's write the RLS check!
}

run();
