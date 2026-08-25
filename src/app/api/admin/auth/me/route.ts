import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken, ADMIN_SESSION_COOKIE } from '@/lib/admin/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await validateAdminToken(token);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ admin: session.admin });
}
