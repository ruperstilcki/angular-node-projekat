const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');

// Define schema for User documents
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// userSchema.plugin(uniqueValidator);

// Export Mongoose model, which will manage the "users" collection
module.exports = mongoose.model('User', userSchema);
