import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

export interface AuthUser {
  id: string;
  email: string;
  role: 'customer' | 'staff';
  firstName?: string;
  lastName?: string;
  customerId?: string;
}

// Simple JSON encoding for session data (Edge Runtime compatible)
export function createSecureSession(user: AuthUser): string {
  const sessionData = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    customerId: user.customerId,
    timestamp: Date.now(),
  };
  return JSON.stringify(sessionData);
}

export function parseSecureSession(session: string): AuthUser | null {
  try {
    const sessionData = JSON.parse(session);
    
    // Check if session is expired (7 days)
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - sessionData.timestamp > sevenDaysInMs) {
      return null;
    }
    
    return {
      id: sessionData.id,
      email: sessionData.email,
      role: sessionData.role,
      firstName: sessionData.firstName,
      lastName: sessionData.lastName,
      customerId: sessionData.customerId,
    };
  } catch (error) {
    console.error('Failed to parse session:', error);
    return null;
  }
}

export async function validateUser(email: string, password: string, role?: string) {
  await connectToDatabase();

  // Find user by email, optionally filter by role
  const query: any = { email, isActive: true };
  if (role) {
    query.role = role;
  }
  
  const user = await User.findOne(query);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    customerId: user.customerId
  };
}

export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return null;
    }

    // Parse the encoded session
    const sessionData = parseSecureSession(session);
    
    if (!sessionData) {
      return null;
    }

    // Verify user still exists and is active in database
    await connectToDatabase();
    const user = await User.findOne({ 
      _id: sessionData.id, 
      email: sessionData.email,
      isActive: true 
    }).select('-password');
    
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      customerId: user.customerId
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function requireAuth(allowedRoles: string[] = []) {
  return async (request: NextRequest) => {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return { error: 'Unauthorized', status: 401 };
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return { error: 'Forbidden', status: 403 };
    }
    
    return { user };
  };
}

// Helper function for client-side session validation
export async function getCurrentUserFromSession(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/me');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
