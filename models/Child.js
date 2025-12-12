const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    admission_date: { type: Date, required: true }
});

module.exports = mongoose.model('Child', childSchema);