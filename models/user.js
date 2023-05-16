import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    favorites: { type: [{
      name: { type: String },
    }], default: [], required: false },
  });
  
export default mongoose.model('User', userSchema);