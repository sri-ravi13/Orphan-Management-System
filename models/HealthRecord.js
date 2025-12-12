const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    medical_history: { type: String, required: true },
    vaccinations: { type: String, required: true },
    treatments: { type: String, required: true },
    last_checkup: { type: Date, required: true },
    next_appointment: { type: Date, required: true }
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);