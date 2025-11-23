import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { validateUser, createSecureSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Validate user credentials
    const user = await validateUser(email, password, role);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create secure session
    const secureSession = createSecureSession(user);

    const sessionCookie = serialize('session', secureSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    const response = NextResponse.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        customerId: user.customerId
      }
    });
    
    response.headers.set('Set-Cookie', sessionCookie);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
