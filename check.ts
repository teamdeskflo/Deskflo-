import { createClient } from './src/lib/supabase/client';
const supabase = createClient();
const insertQuery = supabase.from('tasks').insert({
  freelancer_id: '123',
  title: 'test',
  description: null,
  priority: 'medium',
  is_completed: false,
  due_date: null,
  project_id: null,
});
