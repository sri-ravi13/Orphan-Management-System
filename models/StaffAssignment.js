const mongoose = require('mongoose');

const staffAssignmentSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assigned_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StaffAssignment', staffAssignmentSchema);