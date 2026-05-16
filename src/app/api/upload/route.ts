import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// ── POST /api/upload ──────────────────────────────────────────
// Accepts multipart/form-data with: file (blob), bucket (string), folder (string)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file   = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'project-files';
    const folder = (formData.get('folder') as string) || user.id;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt  = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    // Use admin client so we can upload regardless of RLS on storage.objects
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    // Build public URL
    const { data: { publicUrl } } = admin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return NextResponse.json({
      path: data.path,
      publicUrl,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    }, { status: 201 });

  } catch (err: unknown) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
