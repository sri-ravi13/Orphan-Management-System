const mongoose = require('mongoose');

const educationalRecordSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    school_name: { type: String, required: true },
    grade: { type: String, required: true },
    performance: { type: String, required: true },
    extracurricular_activities: { type: String, required: true },
    attendance: { type: String, required: true },
    class: { type: String, required: true }
});

module.exports = mongoose.model('EducationalRecord', educationalRecordSchema);