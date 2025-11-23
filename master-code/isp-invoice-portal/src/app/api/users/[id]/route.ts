import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    // Get current user from session
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(params.id).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Users can only view their own profile, staff can view all
    if (currentUser.role !== 'staff' && currentUser.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    // Get current user from session
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await req.json();
    
    // Check if user exists
    const existingUser = await User.findById(params.id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Users can only update their own profile, staff can update all
    if (currentUser.role !== 'staff' && currentUser.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If not staff, restrict which fields can be updated
    let updatePayload = userData;
    if (currentUser.role !== 'staff') {
      const allowedFields = ['firstName', 'lastName', 'phone', 'address'];
      const filteredData: { [key: string]: any } = {};
      
      allowedFields.forEach(field => {
        if (field in userData) {
          filteredData[field] = userData[field];
        }
      });
      
      updatePayload = filteredData;
    }
    
    // Check if email is being changed and if it conflicts with another user
    if (updatePayload.email && updatePayload.email !== existingUser.email) {
      const emailConflict = await User.findOne({ 
        email: updatePayload.email, 
        _id: { $ne: params.id } 
      });
      if (emailConflict) {
        return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
      }
    }
    
    // Prepare update data
    const updateData = { ...updatePayload };
    
    // Hash password if provided
    if (updatePayload.password) {
      updateData.password = await bcrypt.hash(updatePayload.password, 12);
    } else {
      delete updateData.password; // Don't update password if not provided
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    // Get current user from session
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only staff can delete users
    if (currentUser.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check if user exists
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Delete user
    await User.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}
