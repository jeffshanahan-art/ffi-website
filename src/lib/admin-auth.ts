import type { NextRequest } from 'next/server';

export function isAdminRequest(request: NextRequest): boolean {
  return request.cookies.get('ffi_admin')?.value === 'authenticated';
}
