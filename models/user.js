import mongoose from 'mongoose';
// import uniqueValidator from 'mongoose-unique-validator';

// Define schema for User documents
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);
export default User; // Export Mongoose model, which will manage the "users" collection
