import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  try {
    // Clear the session cookie
    const sessionCookie = serialize('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    const response = NextResponse.json({ 
      message: 'Logout successful'
    });
    
    response.headers.set('Set-Cookie', sessionCookie);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
