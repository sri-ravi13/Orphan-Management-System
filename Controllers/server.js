require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); 

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


const UPLOADS_FOLDER_PATH = path.join(__dirname, '..', 'uploads');

const PUBLIC_FOLDER_PATH = path.join(__dirname, '..', 'public');


try {
    if (!fs.existsSync(UPLOADS_FOLDER_PATH)) {
        fs.mkdirSync(UPLOADS_FOLDER_PATH, { recursive: true });
        console.log(`Uploads directory created at: ${UPLOADS_FOLDER_PATH}`);
    } else {
        console.log(`Uploads directory found at: ${UPLOADS_FOLDER_PATH}`);
    }
} catch (err) {
    console.error(`Error ensuring uploads directory exists: ${err.message}`);
    process.exit(1); 
}


app.use('/uploads', express.static(UPLOADS_FOLDER_PATH));

app.use(express.static(PUBLIC_FOLDER_PATH)); 



const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/orphanageDB';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected successfully to orphanageDB'))
    .catch(err => console.error('MongoDB Connection Error:', err.message));

const userSchema = new mongoose.Schema({
    name: { type: String, required: false },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone_number: { type: String, required: false },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: false },
    password: { type: String, required: true }, 
    role: { type: String, enum: ['Admin', 'Staff', 'Public', 'Medical', 'Educational'], default: 'Public' }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);


const childSchema = new mongoose.Schema({
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    date_of_birth: { type: Date, required: true },
    age: { type: Number, required: true, min: 0 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    admission_date: { type: Date, required: true, default: Date.now },
    photo_url: { type: String, default: '/img/default_avatar.png' }, 
    
}, { timestamps: true });
const Child = mongoose.model('Child', childSchema);


const healthRecordSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    medical_history: { type: String, required: true },
    vaccinations: { type: String, required: true },
    treatments: { type: String, required: true },
    last_checkup: { type: Date, required: true },
    next_appointment: { type: Date, required: true }
}, { timestamps: true });
const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);


const educationalRecordSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    school_name: { type: String, required: true },
    grade: { type: String, required: true },
    class: { type: String, required: true },
    performance: { type: String, required: true },
    attendance: { type: String, required: true },
    extracurricular_activities: { type: String, required: true }
}, { timestamps: true });
const EducationalRecord = mongoose.model('EducationalRecord', educationalRecordSchema);


const messageSchema = new mongoose.Schema({
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message_text: { type: String, required: true },
    sent_at: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);


const staffAssignmentSchema = new mongoose.Schema({
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    assigned_at: { type: Date, default: Date.now }
});
staffAssignmentSchema.index({ staff_id: 1, child_id: 1 }, { unique: true });
const StaffAssignment = mongoose.model('StaffAssignment', staffAssignmentSchema);


const adoptionSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true, unique: true },
    adopter_name: { type: String, required: true },
    adopter_contact: { type: String, required: true },
    adopter_nid: { type: String, required: true },
    adoption_date: { type: Date, required: true, default: Date.now }
}, { timestamps: true });
const Adoption = mongoose.model('Adoption', adoptionSchema);


const donationSchema = new mongoose.Schema({
    donor_name: { type: String, required: true },
    donor_email: { type: String, required: false },
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ['one-time', 'monthly'], required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Completed', 'Pending', 'Failed', 'Refunded'], default: 'Pending' },
    transaction_id: { type: String, required: false, unique: true, sparse: true }
}, { timestamps: true });
const Donation = mongoose.model('Donation', donationSchema);


const scheduleSchema = new mongoose.Schema({
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskDescription: { type: String, required: true },
    dueDate: { type: Date, required: false },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    dateAssigned: { type: Date, default: Date.now },
    dateCompleted: { type: Date, required: false },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
}, { timestamps: true });
const Schedule = mongoose.model('Schedule', scheduleSchema);


const documentSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true }, 
    mimetype: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
});
const Document = mongoose.model('Document', documentSchema);


const inquirySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: false },
    status: { type: String, enum: ['New', 'Responded', 'Closed'], default: 'New' },
    receivedAt: { type: Date, default: Date.now }
}, { timestamps: true });
const Inquiry = mongoose.model('Inquiry', inquirySchema);


const imageFileFilter = (req, file, cb) => { if (file.mimetype.startsWith('image/')) { cb(null, true); } else { cb(new Error('Only image files are allowed!'), false); } };
const childPhotoStorage = multer.diskStorage({ destination: UPLOADS_FOLDER_PATH, filename: (req, file, cb) => { const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); cb(null, 'child-' + uniqueSuffix + path.extname(file.originalname)); } });
const documentStorage = multer.diskStorage({ destination: UPLOADS_FOLDER_PATH, filename: (req, file, cb) => { const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'); cb(null, `doc-${req.params.id || 'unknown'}-${uniqueSuffix}-${safeOriginalName}`); } });
const uploadChildPhoto = multer({ storage: childPhotoStorage, fileFilter: imageFileFilter });
const uploadDocument = multer({ storage: documentStorage });


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});
transporter.verify((error, success) => {
    if (error) { console.error('Nodemailer config error:', error.message); console.warn("Email sending may fail."); }
    else { console.log('Nodemailer is ready to send emails'); }
});


const adoptionProcedureDetails = `
Thank you for your interest in adoption! We are thrilled you are considering providing a loving home for one of our children.
Here is a general overview of our adoption process:
1.  **Initial Inquiry:** Submit the contact form expressing your interest.
2.  **Information Session:** We will invite you to an information session (online or in-person) to learn more about adoption through our organization and the needs of our children.
3.  **Application:** Complete and submit a formal adoption application form, including background checks and references.
4.  **Home Study:** A licensed social worker will conduct a home study, which involves interviews and home visits to assess your suitability and readiness for adoption.
5.  **Matching:** If approved, we will work with you to identify a potential match based on your preferences and the child's needs.
6.  **Pre-Placement Visits:** You will have opportunities to meet and interact with the child before placement.
7.  **Placement:** Once all parties agree, the child is placed in your home.
8.  **Post-Placement Supervision:** A social worker will provide support and supervision for a period after placement (typically 6 months).
9.  **Legal Finalization:** After the supervisory period, the adoption can be legally finalized in court.
**Please note:** This is a general outline. Specific requirements and timelines may vary. We prioritize the well-being and best interests of the child throughout the process.
We will review your inquiry and a member of our adoption team will contact you shortly to discuss the next steps.
Sincerely,
The Adoption Team
Orphanage Management System
`;
const identifyUserFromHeader = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id']; 

        if (!userId) {
            console.warn("Auth Warning: Missing 'X-User-ID' header.");
            
            return res.status(401).json({ message: "Authentication required: Missing user identifier header." });
        }

        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
             console.warn(`Auth Warning: Invalid format for 'X-User-ID' header: ${userId}`);
             return res.status(400).json({ message: "Invalid user identifier format." });
        }

        
        
        const user = await User.findById(userId).select('-password'); 

        if (!user) {
            console.error(`Auth Error: User not found for ID in header: ${userId}`);
            
            return res.status(401).json({ message: "Authentication failed: User not found." });
        }

        
        req.user = user;
        console.log(`User Identified (from header): ${user.username} (${user._id})`); 
        next(); 

    } catch (error) {
        console.error("Identify User Middleware Error:", error);
        res.status(500).json({ message: "Authentication processing error", error: error.message });
    }
};



app.post('/api/register', async (req, res) => {
    try {
        const { name, username, email, phone_number, gender, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }
        const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or Username already exists' });
        }
        const newUser = new User({ name, username, email: email.toLowerCase(), phone_number, gender, password }); 
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || user.password !== password) { 
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json({
            message: 'Login successful',
            user: { _id: user._id, username: user.username, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});


app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); 
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});


app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});



app.post('/api/users', async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        
        const newUser = new User({ username, email, password, role });
        const savedUser = await newUser.save();
        
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);
    } catch (error) {
        
        if (error.code === 11000) {
             return res.status(409).json({ message: 'Username or Email already exists.', error: error.message });
        }
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});


app.put('/api/users/:id', async (req, res) => {
    const { username, email, role } = req.body;
    
    
    if (!username || !email || !role) {
        return res.status(400).json({ message: 'Missing required fields (username, email, role)' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, role },
            { new: true, runValidators: true } 
        ).select('-password'); 

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
         if (error.code === 11000) { 
             return res.status(409).json({ message: 'Username or Email already exists.', error: error.message });
        }
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});


app.delete('/api/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

app.get('/api/messages/users', async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['Admin', 'Staff'] } }).select('username _id name');
        res.status(200).json(users);
    } catch (error) {
        console.error("Fetch Messaging Users error:", error);
        res.status(500).json({ message: 'Error fetching users for messaging', error: error.message });
    }
});


app.post('/api/children', uploadChildPhoto.single('photo'), async (req, res) => {
    try {
        const { first_name, last_name, date_of_birth, age, gender, admission_date } = req.body;
        if (!first_name || !last_name || !date_of_birth || age === undefined || age === '' || !gender || !admission_date) {
             if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : '/img/default_avatar.png';

        const newChild = new Child({
            first_name,
            last_name,
            date_of_birth: new Date(date_of_birth),
            age: parseInt(age, 10), 
            gender,
            admission_date: new Date(admission_date),
            photo_url: photoUrl
        });
        await newChild.save();
        res.status(201).json({ message: 'Child added successfully', child: newChild });
    } catch (error) {
        console.error("Add child error:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error adding child', error: error.message });
    }
});
app.get('/api/children', async (req, res) => {
    try {
        const children = await Child.find().sort({ admission_date: -1 });
        res.status(200).json(children);
    } catch (error) {
        console.error("Fetch Children error:", error);
        res.status(500).json({ message: 'Error fetching children', error: error.message });
    }
});

app.get('/api/children/:id', async (req, res) => {
    try {
        const child = await Child.findById(req.params.id);
        if (!child) return res.status(404).json({ message: 'Child not found' });
        res.status(200).json(child);
    } catch (error) {
        console.error("Fetch Child by ID error:", error);
        res.status(500).json({ message: 'Error fetching child', error: error.message });
    }
});
app.put('/api/children/:id', uploadChildPhoto.single('photo'), async (req, res) => {
     try {
        const { first_name, last_name, date_of_birth, age, gender, admission_date } = req.body;
        const updateData = { first_name, last_name, date_of_birth, age: parseInt(age, 10), gender, admission_date };
        if (!first_name || !last_name || !date_of_birth || age === undefined || age === '' || !gender || !admission_date) {
             if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Missing required fields' });
        }
        let oldPhotoPath = null;
        let oldPhotoUrl = null;
        if (req.file) {
            try {
                const existingChild = await Child.findById(req.params.id).select('photo_url');
                 if (existingChild && existingChild.photo_url && existingChild.photo_url !== '/img/default_avatar.png') { 
                    oldPhotoUrl = existingChild.photo_url;
                    oldPhotoPath = path.join(UPLOADS_FOLDER_PATH, path.basename(existingChild.photo_url));
                 }
            } catch (findErr) { console.error("Error finding old photo:", findErr.message); }
            
            updateData.photo_url = `/uploads/${req.file.filename}`;
        }

        const updatedChild = await Child.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

        if (!updatedChild) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Child not found' });
        }
        if (req.file && oldPhotoPath && fs.existsSync(oldPhotoPath)) {
            fs.unlink(oldPhotoPath, (err) => {
                if (err) console.error("Error deleting old photo:", err);
                else console.log("Old photo deleted:", oldPhotoPath);
            });
        } else if (req.file && oldPhotoUrl && oldPhotoUrl !== '/img/default_avatar.png') {
             console.warn("Old photo URL found but file path could not be deleted:", oldPhotoPath);
        }
        res.status(200).json({ message: 'Child updated successfully', child: updatedChild });
    } catch (error) {
        console.error("Update child error:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error updating child', error: error.message });
    }
});
app.delete('/api/children/:id', async (req, res) => {
    try {
        const child = await Child.findByIdAndDelete(req.params.id);
        if (!child) return res.status(404).json({ message: 'Child not found' });

        
        if (child.photo_url && child.photo_url.startsWith('/uploads/')) { 
            const photoPath = path.join(UPLOADS_FOLDER_PATH, path.basename(child.photo_url));
            if (fs.existsSync(photoPath)) {
                fs.unlink(photoPath, (err) => {
                    if (err) console.error("Error deleting child photo file:", err);
                    else console.log("Deleted child photo file:", photoPath);
                });
            } else {
                console.warn(`Photo file not found for deleted child: ${photoPath}`);
            }
        }
        
        await HealthRecord.deleteMany({ child_id: req.params.id });
        await EducationalRecord.deleteMany({ child_id: req.params.id });
        await Document.deleteMany({ child_id: req.params.id });
        await StaffAssignment.deleteMany({ child_id: req.params.id });
        await Adoption.deleteOne({ child_id: req.params.id });

        console.log(`Deleted child ${req.params.id} and associated data.`);
        res.status(200).json({ message: 'Child and associated records deleted successfully' });
    } catch (error) {
        console.error("Delete Child error:", error);
        res.status(500).json({ message: 'Error deleting child', error: error.message });
    }
});

app.post('/api/children/:id/documents', uploadDocument.single('documentFile'), async (req, res) => { 
    try {
        const childId = req.params.id;
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

        const childExists = await Child.findById(childId);
        if (!childExists) {
             if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Child not found.' });
        }

        const newDocument = new Document({
            child_id: childId,
            filename: req.file.originalname,
            path: `/uploads/${req.file.filename}`,
            mimetype: req.file.mimetype
        });

        await newDocument.save();
        res.status(201).json({ message: 'Document uploaded successfully', document: newDocument });

    } catch (error) {
        console.error("Document upload error:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error uploading document', error: error.message });
    }
});

app.get('/api/children/:id/documents', async (req, res) => {
    try {
        const childId = req.params.id;
        const documents = await Document.find({ child_id: childId }).sort({ uploadDate: -1 });
        res.status(200).json(documents);
    } catch (error) {
        console.error("Fetch Child Documents error:", error);
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
});

app.get('/api/documents/:docId/download', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.docId);
        if (!doc) return res.status(404).json({ message: 'Document not found.' });

        const filePath = path.join(UPLOADS_FOLDER_PATH, path.basename(doc.path));

        if (!fs.existsSync(filePath)) {
             console.error(`File not found on server: ${filePath}`);
            return res.status(404).json({ message: 'File not found on server.' });
        }

        res.download(filePath, doc.filename, (err) => {
            if (err) {
                console.error("Error during file download:", err);
                if (!res.headersSent) {
                    res.status(500).send('Could not download the file.');
                }
            } else {
                 console.log(`File downloaded: ${doc.filename}`);
            }
        });
    } catch (error) {
        console.error("Download document error:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error processing document download', error: error.message });
        }
    }
});



app.post('/api/health-records', async (req, res) => {
    try {
        const newRecord = new HealthRecord(req.body);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (error) {
        console.error("Add Health Record error:", error);
        res.status(400).json({ message: 'Error adding health record', error: error.message });
    }
});

app.get('/api/health-records', async (req, res) => {
    try {
        const records = await HealthRecord.find().populate({
            path: 'child_id',
            select: 'first_name last_name' 
        }).sort({ createdAt: -1 });
        res.status(200).json(records);
    } catch (error) {
        console.error("Fetch Health Records error:", error);
        res.status(500).json({ message: 'Error fetching health records', error: error.message });
    }
});

app.get('/api/health-records/:id', async (req, res) => {
    try {
        const record = await HealthRecord.findById(req.params.id).populate('child_id', 'first_name last_name');
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json(record);
    } catch (error) {
        console.error("Fetch Health Record by ID error:", error);
        res.status(500).json({ message: 'Error fetching health record', error: error.message });
    }
});

app.put('/api/health-records/:id', async (req, res) => {
    try {
        const updatedRecord = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedRecord) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json(updatedRecord);
    } catch (error) {
        console.error("Update Health Record error:", error);
        res.status(400).json({ message: 'Error updating health record', error: error.message });
    }
});

app.delete('/api/health-records/:id', async (req, res) => {
    try {
        const deletedRecord = await HealthRecord.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json({ message: 'Health record deleted' });
    } catch (error) {
        console.error("Delete Health Record error:", error);
        res.status(500).json({ message: 'Error deleting health record', error: error.message });
    }
});



app.post('/api/educational-records', async (req, res) => {
    try {
        const newRecord = new EducationalRecord(req.body);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (error) {
        console.error("Add Educational Record error:", error);
        res.status(400).json({ message: 'Error adding educational record', error: error.message });
    }
});

app.get('/api/educational-records', async (req, res) => {
    try {
        const records = await EducationalRecord.find().populate({
             path: 'child_id',
             select: 'first_name last_name'
         }).sort({ createdAt: -1 });
        res.status(200).json(records);
    } catch (error) {
        console.error("Fetch Educational Records error:", error);
        res.status(500).json({ message: 'Error fetching educational records', error: error.message });
    }
});

app.get('/api/educational-records/:id', async (req, res) => {
    try {
        const record = await EducationalRecord.findById(req.params.id).populate('child_id', 'first_name last_name');
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json(record);
    } catch (error) {
        console.error("Fetch Educational Record by ID error:", error);
        res.status(500).json({ message: 'Error fetching educational record', error: error.message });
    }
});

app.put('/api/educational-records/:id', async (req, res) => {
    try {
        const updatedRecord = await EducationalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedRecord) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json(updatedRecord);
    } catch (error) {
        console.error("Update Educational Record error:", error);
        res.status(400).json({ message: 'Error updating educational record', error: error.message });
    }
});

app.delete('/api/educational-records/:id', async (req, res) => {
    try {
        const deletedRecord = await EducationalRecord.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json({ message: 'Educational record deleted' });
    } catch (error) {
        console.error("Delete Educational Record error:", error);
        res.status(500).json({ message: 'Error deleting educational record', error: error.message });
    }
});


app.post('/api/messages', identifyUserFromHeader, async (req, res) => { 
    try {
        const { receiver_id, message_text } = req.body;
        const sender_id = req.user._id; 

        if (!receiver_id || !message_text) {
            return res.status(400).json({ message: 'Receiver and message text are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(receiver_id)) {
             return res.status(400).json({ message: 'Invalid receiver ID format.'});
        }

        const receiverExists = await User.findById(receiver_id);
        if (!receiverExists) {
            return res.status(404).json({ message: 'Receiver user not found' });
        }
         
         if (sender_id.equals(receiverExists._id)) {
            return res.status(400).json({ message: 'Cannot send messages to yourself.' });
         }

        const newMessage = new Message({ sender_id, receiver_id, message_text });
        await newMessage.save();
        const populatedMessage = await Message.findById(newMessage._id).populate('sender_id', 'username name');
        res.status(201).json(populatedMessage || newMessage);

    } catch (error) {
        console.error("Send Message error:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
});


app.get('/api/messages', identifyUserFromHeader, async (req, res) => { 
    try {
        const userId = req.user._id; 

        const messages = await Message.find({ receiver_id: userId })
            .populate('sender_id', 'username name')
            .sort({ sent_at: -1 });

        
        res.status(200).json(messages);
    } catch (error) {
        console.error("Fetch Messages error:", error);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
});




app.get('/api/staff-assignments/staff', async (req, res) => {
    try {
        const staff = await User.find({ role: 'Staff' }).select('username _id'); 
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff list', error: error.message });
    }
});


app.get('/api/staff-assignments/children', async (req, res) => {
    try {
        
        const children = await Child.find().select('first_name last_name _id');
        res.status(200).json(children);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching children list for assignments', error: error.message });
    }
});


app.get('/api/staff-assignments', async (req, res) => {
    try {
        const filter = {};
        
        if (req.query.staff_id) {
             
             if (!mongoose.Types.ObjectId.isValid(req.query.staff_id)) {
                 return res.status(400).json({ message: 'Invalid staff_id format provided for filtering.' });
             }
            filter.staff_id = req.query.staff_id;
        }

        console.log("Fetching assignments with filter:", filter); 

        const assignments = await StaffAssignment.find(filter)
            
            .populate('child_id', 'first_name last_name') 
            .populate('staff_id', 'username'); 

        console.log(`Found ${assignments.length} assignments.`); 
        res.status(200).json(assignments);

    } catch (error) {
        
        console.error("Fetch Assignments error:", error); 
        res.status(500).json({ message: 'Error fetching staff assignments', error: error.message });
    }
});


app.get('/api/staff-assignments/:id', async (req, res) => {
    try {
        
        const assignment = await StaffAssignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json(assignment); 
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignment', error: error.message });
    }
});



app.post('/api/staff-assignments', async (req, res) => {
    const { child_id, staff_id } = req.body;
     if (!child_id || !staff_id) {
        return res.status(400).json({ message: 'Child ID and Staff ID are required' });
    }
    try {
        const newAssignment = new StaffAssignment({ child_id, staff_id });
        const savedAssignment = await newAssignment.save();
        const populatedAssignment = await StaffAssignment.findById(savedAssignment._id)
             .populate('child_id', 'first_name last_name')
             .populate('staff_id', 'username');
        res.status(201).json(populatedAssignment);
    } catch (error) {
         if (error.code === 11000) { 
             return res.status(409).json({ message: 'This staff member may already be assigned to this child.', error: error.message });
        }
        res.status(500).json({ message: 'Error creating staff assignment', error: error.message });
    }
});


app.put('/api/staff-assignments/:id', async (req, res) => {
    const { child_id, staff_id } = req.body;
      if (!child_id || !staff_id) {
        return res.status(400).json({ message: 'Child ID and Staff ID are required for update' });
    }
    try {
        const updatedAssignment = await StaffAssignment.findByIdAndUpdate(
            req.params.id,
            { child_id, staff_id },
            { new: true, runValidators: true }
        ).populate('child_id', 'first_name last_name').populate('staff_id', 'username');
        if (!updatedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json(updatedAssignment);
    } catch (error) {
         if (error.code === 11000) { 
             return res.status(409).json({ message: 'This staff member may already be assigned to this child.', error: error.message });
        }
        res.status(500).json({ message: 'Error updating staff assignment', error: error.message });
    }
});


app.delete('/api/staff-assignments/:id', async (req, res) => {
    try {
        const deletedAssignment = await StaffAssignment.findByIdAndDelete(req.params.id);
        if (!deletedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting assignment', error: error.message });
    }
});


app.post('/api/adoptions', async (req, res) => {
    try {
        const newAdoption = new Adoption(req.body);
        await newAdoption.save();
        const populatedAdoption = await Adoption.findById(newAdoption._id)
                                     .populate('child_id', 'first_name last_name');
        res.status(201).json(populatedAdoption);
    } catch (error) {
        console.error("Add Adoption error:", error);
        if (error.code === 11000) {
            res.status(400).json({ message: 'This child has already been recorded as adopted.' });
        } else {
            res.status(400).json({ message: 'Error adding adoption record', error: error.message });
        }
    }
});

app.get('/api/adoptions', async (req, res) => {
    try {
        const adoptions = await Adoption.find()
                                     .populate('child_id', 'first_name last_name')
                                     .sort({ adoption_date: -1 });
        res.status(200).json(adoptions);
    } catch (error) {
        console.error("Fetch Adoptions error:", error);
        res.status(500).json({ message: 'Error fetching adoption records', error: error.message });
    }
});

app.get('/api/adoptions/:id', async (req, res) => {
    try {
        const adoption = await Adoption.findById(req.params.id)
                                     .populate('child_id', 'first_name last_name'); 
        if (!adoption) return res.status(404).json({ message: 'Adoption record not found' });
        res.status(200).json(adoption);
    } catch (error) {
        console.error("Fetch Adoption by ID error:", error);
        res.status(500).json({ message: 'Error fetching adoption record', error: error.message });
    }
});


app.put('/api/adoptions/:id', async (req, res) => {
    try {
        
        const updatedAdoption = await Adoption.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
                                        .populate('child_id', 'first_name last_name');
        if (!updatedAdoption) return res.status(404).json({ message: 'Adoption record not found' });
        res.status(200).json(updatedAdoption);
    } catch (error) {
        console.error("Update Adoption error:", error);
         
         if (error.code === 11000) {
             res.status(400).json({ message: 'Cannot update: The selected child is already recorded as adopted in another record.' });
         } else {
            res.status(400).json({ message: 'Error updating adoption record', error: error.message });
         }
    }
});

app.delete('/api/adoptions/:id', async (req, res) => {
    try {
        const deletedAdoption = await Adoption.findByIdAndDelete(req.params.id);
        if (!deletedAdoption) return res.status(404).json({ message: 'Adoption record not found' });
        res.status(200).json({ message: 'Adoption record deleted' });
    } catch (error) {
        console.error("Delete Adoption error:", error);
        res.status(500).json({ message: 'Error deleting adoption record', error: error.message });
    }
});







app.post('/api/donations', async (req, res) => {
    try {
        
        const { donation_amount, donation_frequency, cardholder_name, donor_email } = req.body;

        
        if (!donation_amount || !donation_frequency || !cardholder_name) {
            return res.status(400).json({ message: 'Missing required donation fields (amount, frequency, name).' });
        }
        const amount = parseFloat(donation_amount);
        if (isNaN(amount) || amount <= 0) {
             return res.status(400).json({ message: 'Invalid donation amount.' });
        }

        const newDonation = new Donation({
            donor_name: cardholder_name, 
            donor_email: donor_email || null, 
            amount: amount,
            frequency: donation_frequency,
            status: 'Completed', 
            transaction_id: `sim_txn_${Date.now()}${Math.floor(Math.random()*1000)}` 
            
        });

        await newDonation.save();
        console.log("Donation recorded:", newDonation._id); 
        res.status(201).json({ message: 'Donation recorded successfully (Simulated)', donation: newDonation });

    } catch (error) {
        console.error("Record Donation error:", error);
        
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error recording donation', error: error.message });
    }
});

app.get('/api/donations', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ date: -1 }); 
        res.status(200).json(donations);
    } catch (error) {
        console.error("Fetch Donations error:", error);
        res.status(500).json({ message: 'Error fetching donations', error: error.message });
    }
});

app.get('/api/my-schedule', identifyUserFromHeader, async (req, res) => {
    try {
        const staffId = req.user._id; 

        if (!staffId) {
            
            return res.status(401).json({ message: "Staff user not identified." });
        }

        const tasks = await Schedule.find({ staffId: staffId }) 
                                    .sort({ dateAssigned: -1 }); 

        res.status(200).json(tasks);

    } catch (error) {
        console.error("Fetch My Schedule error:", error);
        res.status(500).json({ message: 'Error fetching your schedule', error: error.message });
    }
});


app.patch('/api/schedule/:id/complete', identifyUserFromHeader, async (req, res) => {
    try {
        const taskId = req.params.id;
        const staffId = req.user._id; 

        const task = await Schedule.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        
        if (!task.staffId.equals(staffId)) {
            return res.status(403).json({ message: 'Forbidden: You are not assigned to this task.' });
        }

        
        if (task.status === 'completed') {
             return res.status(400).json({ message: 'Task is already marked as complete.' });
        }

        
        task.status = 'completed';
        task.dateCompleted = new Date();
        await task.save();

        
        
        res.status(200).json({ message: 'Task marked as complete', task: task }); 

    } catch (error) {
         console.error("Mark Task Complete error:", error);
         if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Task ID format.' });
         }
         res.status(500).json({ message: 'Error updating task status', error: error.message });
     }
 });
app.post('/api/schedule', async (req, res) => {
    try {
    const { staffId, taskDescription, dueDate } = req.body;
    if (!staffId || !taskDescription) return res.status(400).json({ message: 'Staff ID and Task Description are required' });
    const newTask = new Schedule({ staffId, taskDescription, dueDate: dueDate || null });
    await newTask.save();
    const populatedTask = await Schedule.findById(newTask._id).populate('staffId', 'username name'); 
    res.status(201).json(populatedTask);
    } catch (error) {
    console.error("Assign Task error:", error);
    res.status(500).json({ message: 'Error scheduling task', error: error.message });
    }
    });
    app.get('/api/schedule', async (req, res) => {
    try {
    const tasks = await Schedule.find()
    
    
    .populate('staffId', 'username name')
    .sort({ dateAssigned: -1 });
    res.status(200).json(tasks);
    } catch (error) {
    console.error("Fetch Schedule error:", error); 
    res.status(500).json({ message: 'Error fetching schedule', error: error.message });
    }
    });
    app.get('/api/staff/schedule', async (req, res) => {
    try {
    const staffId = req.query.staffId;
    if (!staffId) return res.status(400).json({ message: 'Staff ID is required' });
    const tasks = await Schedule.find({ staffId: staffId }).sort({ dateAssigned: -1 });
    res.status(200).json(tasks);
    } catch (error) {
    console.error("Fetch Staff Schedule error:", error);
    res.status(500).json({ message: 'Error fetching staff schedule', error: error.message });
    }
    });
    app.delete('/api/schedule/:id', async (req, res) => {
    try {
    const deletedTask = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
    console.error("Delete Task error:", error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
    });


app.get('/api/reports/child-welfare', async (req, res) => {
    try {
        const children = await Child.find().select('first_name last_name date_of_birth gender admission_date age').sort({ admission_date: -1 });
        res.status(200).json(children);
    } catch (error) {
        console.error("Child Welfare Report error:", error);
        res.status(500).json({ message: 'Error generating child welfare report', error: error.message });
    }
});

app.get('/api/reports/educational-performance', async (req, res) => {
    try {
        const records = await EducationalRecord.find()
            .populate('child_id', 'first_name last_name')
            .sort({ 'child_id.last_name': 1, 'child_id.first_name': 1 });
        res.status(200).json(records);
    } catch (error) {
        console.error("Educational Report error:", error);
        res.status(500).json({ message: 'Error generating educational performance report', error: error.message });
    }
});

app.get('/api/reports/health-records', async (req, res) => {
    try {
        const records = await HealthRecord.find()
            .populate('child_id', 'first_name last_name')
            .sort({ 'child_id.last_name': 1, 'child_id.first_name': 1 });
        res.status(200).json(records);
    } catch (error) {
        console.error("Health Report error:", error);
        res.status(500).json({ message: 'Error generating health records report', error: error.message });
    }
});

app.post('/api/inquiries', async (req, res) => {
    try {
        const { name, email, subject, message, childId } = req.body; 

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Name, email, subject, and message are required.' });
        }

        
        let child = null;
        if (childId) {
            if (!mongoose.Types.ObjectId.isValid(childId)) {
                 console.warn(`Received inquiry with invalid childId format: ${childId}`);
                 
                 
            } else {
                child = await Child.findById(childId).select('first_name'); 
                if (!child) {
                    console.warn(`Received inquiry for non-existent childId: ${childId}`);
                    
                    
                }
            }
        }

        const newInquiry = new Inquiry({
            name,
            email,
            subject,
            message,
            childId: child ? child._id : null 
        });

        await newInquiry.save();
        console.log('Inquiry saved:', newInquiry._id);

        
        const mailSubject = `Regarding Your Inquiry: ${subject}`;
        let mailText = `Dear ${name},\n\nThank you for contacting the Orphanage Management System.\n\nWe have received your message:\n"${message}"\n\nA team member will review your inquiry and respond as soon as possible.\n\n`;

        
        const isAdoptionInquiry = (subject.toLowerCase().includes('adoption') || child);

        if (isAdoptionInquiry) {
            const childNameText = child ? ` regarding ${child.first_name}` : '';
            mailText = `Dear ${name},\n\nThank you for your adoption inquiry${childNameText}!\n\nWe have received your message:\n"${message}"\n\n${adoptionProcedureDetails}`; 
        }

        mailText += '\nThank you,\nOrphanage Management System'; 

        const mailOptions = {
            from: `"Orphanage System" <${process.env.EMAIL_USER || 'your_email@gmail.com'}>`, 
            to: email, 
            subject: mailSubject,
            text: mailText 
            
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Automated email sent successfully to ${email} for inquiry ${newInquiry._id}`);
            res.status(201).json({ message: 'Inquiry received successfully. An email confirmation has been sent.' });
        } catch (emailError) {
            console.error(`Error sending email for inquiry ${newInquiry._id} to ${email}:`, emailError.message);
            
            res.status(201).json({ message: 'Inquiry received, but confirmation email could not be sent.' });
        }

    } catch (error) {
        console.error("Submit Inquiry error:", error);
        res.status(500).json({ message: 'Error submitting inquiry', error: error.message });
    }
});


app.get('/api/inquiries', async (req, res) => {
    
    
    try {
        const inquiries = await Inquiry.find()
            .populate('childId', 'first_name last_name') 
            .sort({ receivedAt: -1 }); 
        res.status(200).json(inquiries);
    } catch (error) {
        console.error("Fetch Inquiries error:", error);
        res.status(500).json({ message: 'Error fetching inquiries', error: error.message });
    }
});


app.use((req, res) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'API Endpoint Not Found' });
});


app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err.stack || err.message);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `File Upload Error: ${err.message}` });
    }
     
     if (err.code === 'EAUTH' || (err.responseCode === 535)) {
        console.error("Nodemailer Authentication Failed - Check EMAIL_USER/EMAIL_PASS in .env");
        
        return res.status(500).json({ message: 'Email configuration error on server.' });
    }
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});