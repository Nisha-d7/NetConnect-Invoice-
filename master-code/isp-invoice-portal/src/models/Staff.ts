import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  
    staffName: {
    type: String,
    require: true,
  },
  staffEmail: {
    type: String,
    require: true,
    unique: true,
  },
  staffPassword: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
  


export default mongoose.models.User || mongoose.model('User', UserSchema);