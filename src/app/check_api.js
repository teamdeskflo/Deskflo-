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
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error("Missing Supabase configuration in env");
    return;
  }

  const supabase = createClient(supabaseUrl, anonKey);

  const email = 'diagnostic_' + Date.now() + '@example.com';
  const password = 'Password123!';

  console.log("Signing up temporary diagnostic user:", email);

  // 1. Sign up user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Diag Freelancer',
        phone: '9999988888'
      }
    }
  });

  if (signUpError) {
    console.error("Sign up failed:", signUpError);
    return;
  }

  const session = signUpData.session;
  const user = signUpData.user;
  console.log("User registered successfully. ID:", user.id);

  // Note: Since email is not confirmed, let's sign in if automatic sign-in happened, or we can use admin to confirm email
  const adminClient = createClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Confirm email via admin
  const { error: confirmError } = await adminClient.auth.admin.updateUserById(user.id, {
    email_confirm: true
  });

  if (confirmError) {
    console.error("Failed to confirm email:", confirmError);
    return;
  }

  console.log("Email confirmed successfully.");

  // Sign in to get active session
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("Sign in failed:", signInError);
    return;
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${signInData.session.access_token}`
      }
    }
  });

  console.log("Authenticated client session active.");

  // 2. Create a test client first
  console.log("Creating test client...");
  const { data: client, error: clientErr } = await authClient
    .from('clients')
    .insert({
      freelancer_id: user.id,
      name: 'Client of Diag',
      email: 'client_diag@example.com'
    })
    .select()
    .single();

  if (clientErr) {
    console.error("Failed to create client:", clientErr);
    return;
  }

  console.log("Client created successfully! ID:", client.id);

  // 3. Try to create project using authenticated user client
  console.log("Inserting project...");
  const { data: project, error: projectErr } = await authClient
    .from('projects')
    .insert({
      client_id: client.id,
      name: 'Test Project',
      description: 'RLS check',
      status: 'active'
    })
    .select()
    .single();

  if (projectErr) {
    console.error("FAILED TO CREATE PROJECT (THE ERROR IS):", projectErr);
  } else {
    console.log("Project created successfully!", project);
  }
}

run();
