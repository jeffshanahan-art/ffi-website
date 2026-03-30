import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ffi2018';
const USER_PASSWORD = process.env.USER_PASSWORD || 'Ffi4life';
const ADMIN_COOKIE = 'ffi_admin';
const USER_COOKIE = 'ffi_user';
const COOKIE_VALUE = 'authenticated';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true, role: 'admin' });
    response.cookies.set(ADMIN_COOKIE, COOKIE_VALUE, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set(USER_COOKIE, COOKIE_VALUE, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  if (password === USER_PASSWORD) {
    const response = NextResponse.json({ success: true, role: 'user' });
    response.cookies.set(USER_COOKIE, COOKIE_VALUE, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const adminCookie = request.cookies.get(ADMIN_COOKIE);
  const userCookie = request.cookies.get(USER_COOKIE);
  const isAdmin = adminCookie?.value === COOKIE_VALUE;
  const isUser = userCookie?.value === COOKIE_VALUE;
  return NextResponse.json({ isAdmin, isUser });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_COOKIE);
  response.cookies.delete(USER_COOKIE);
  return response;
}
