# Orphanage Management System

A comprehensive full-stack web application for managing orphanage operations including child records, health and educational tracking, staff assignments, adoptions, donations, and more.

![Project Banner](img/logo.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Pages](#frontend-pages)
- [Database Models](#database-models)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Development Notes](#development-notes)
- [Common Issues & Solutions](#common-issues--solutions)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## 🌟 Overview

The Orphanage Management System is a complete web-based solution designed to streamline orphanage operations, enhance child care management, and facilitate communication between staff, administrators, and the public. The system provides role-based access control, comprehensive record management, and automated communication features.

## ✨ Features

### Core Features
- **User Management**: Registration, login, and role-based access control (Admin, Staff, Public, Medical, Educational)
- **Child Management**: Complete child profiles with photo uploads and comprehensive information tracking
- **Health Records**: Track medical history, vaccinations, treatments, checkups, and appointments
- **Educational Records**: Monitor school performance, attendance, grades, and extracurricular activities
- **Staff Assignments**: Assign and manage staff responsibilities for specific children
- **Adoption Management**: Track adoption records, adopter information, and adoption procedures
- **Donation System**: Accept and manage one-time or recurring donations
- **Messaging System**: Internal communication between staff and administrators
- **Task Scheduling**: Assign, track, and complete staff tasks with due dates
- **Document Management**: Upload, store, and download child-related documents
- **Inquiry System**: Handle public inquiries with automated email responses
- **Reports Generation**: Generate welfare, educational, and health reports

### User Roles
- **Admin**: Full system access, user management, and system configuration
- **Staff**: Child management, task completion, messaging, and record updates
- **Public**: View children (limited), submit inquiries, and make donations
- **Medical**: Access to health records and medical information
- **Educational**: Access to educational records and performance tracking

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer
- **Email**: Nodemailer
- **Authentication**: Custom header-based identification
- **Body Parsing**: body-parser

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styling with responsive design
- **JavaScript**: Vanilla JS for client-side functionality
- **Font Awesome**: Icons
- **Google Fonts**: Poppins font family

## 📁 Project Structure

```
ORPHAN-MANAGEMENT-SYSTEM/
├── Controllers/              # Backend controller logic (if applicable)
├── node_modules/            # Node.js dependencies
├── public/                  # Public static files
│   ├── css/
│   │   └── styles.css      # Global styles
│   ├── img/                # Images and logos
│   │   └── logo.png
│   ├── about.html          # About page
│   ├── child-details.html  # Child details page
│   ├── children.html       # Children listing page
│   ├── contact.html        # Contact page
│   └── home.html           # Landing page
├── uploads/                # File upload directory
├── Views/                  # Admin and Staff dashboards
│   ├── admin_dashboard.html
│   ├── child_records.html
│   ├── donation.html
│   ├── educational_management.html
│   ├── footer.html
│   ├── generate_reports.html
│   ├── health_records.html
│   ├── login.html
│   ├── manage_adoptions.html
│   ├── manage_donation.html
│   ├── manage_users.html
│   ├── messages.html
│   ├── mfooter.html
│   ├── mnavbar.html
│   ├── navbar.html
│   ├── register.html
│   ├── schedule_work.html
│   ├── staff_child_management.html
│   ├── staff_dashboard.html
│   └── view_inquiries.html
├── css/                    # Additional CSS files
├── img/                    # Additional images
├── models/                 # Mongoose models (if separate)
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)
- **Gmail Account** (for email notifications)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ORPHAN-MANAGEMENT-SYSTEM
```

### 2. Install Dependencies

```bash
npm install
```

Required dependencies will be installed automatically from `package.json`:
- express
- mongoose
- cors
- multer
- nodemailer
- body-parser
- dotenv

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# On Windows:
net start MongoDB

# On macOS/Linux:
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Use in `.env` file

## ⚙️ Configuration

### 1. Create Environment File

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/orphanageDB

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Optional: Additional configurations
NODE_ENV=development
```

### 2. Gmail App Password Setup

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll to "App passwords"
4. Generate a new app password
5. Use this password in `EMAIL_PASS`

**Important**: Never use your regular Gmail password!

### 3. Create Required Directories

The server creates these automatically, but you can create them manually:

```bash
mkdir uploads
mkdir public/img
```

## 🎬 Running the Application

### Development Mode

```bash
# Standard start
npm start

# OR with nodemon (auto-restart on changes)
npm install -D nodemon
npx nodemon server.js
```

### Production Mode

```bash
NODE_ENV=production npm start
```

The application will be available at:
- **Backend API**: `http://localhost:8000`
- **Frontend**: `http://localhost:8000/home.html`

### Verify Installation

1. Check server console for:
   ```
   MongoDB Connected successfully to orphanageDB
   Nodemailer is ready to send emails
   Server is running on http://localhost:8000
   ```

2. Test API endpoint:
   ```bash
   curl http://localhost:8000/api/children
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication

Some endpoints require the `X-User-ID` header:

```javascript
headers: {
  'X-User-ID': '<user_mongodb_id>'
}
```

### Endpoints Overview

#### 🔐 Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |

#### 👥 Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | No |
| GET | `/users/:id` | Get user by ID | No |
| POST | `/users` | Create user | No |
| PUT | `/users/:id` | Update user | No |
| DELETE | `/users/:id` | Delete user | No |
| GET | `/messages/users` | Get messaging users | No |

#### 👶 Children
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/children` | Get all children | No |
| GET | `/children/:id` | Get child by ID | No |
| POST | `/children` | Add child (with photo) | No |
| PUT | `/children/:id` | Update child | No |
| DELETE | `/children/:id` | Delete child | No |

#### 📄 Documents
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/children/:id/documents` | Upload document | No |
| GET | `/children/:id/documents` | Get child documents | No |
| GET | `/documents/:docId/download` | Download document | No |

#### 🏥 Health Records
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health-records` | Get all records | No |
| GET | `/health-records/:id` | Get record by ID | No |
| POST | `/health-records` | Create record | No |
| PUT | `/health-records/:id` | Update record | No |
| DELETE | `/health-records/:id` | Delete record | No |

#### 📚 Educational Records
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/educational-records` | Get all records | No |
| GET | `/educational-records/:id` | Get record by ID | No |
| POST | `/educational-records` | Create record | No |
| PUT | `/educational-records/:id` | Update record | No |
| DELETE | `/educational-records/:id` | Delete record | No |

#### 💬 Messages
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/messages` | Send message | Yes |
| GET | `/messages` | Get messages | Yes |

#### 👔 Staff Assignments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/staff-assignments/staff` | Get staff list | No |
| GET | `/staff-assignments/children` | Get children list | No |
| GET | `/staff-assignments` | Get assignments | No |
| POST | `/staff-assignments` | Create assignment | No |
| PUT | `/staff-assignments/:id` | Update assignment | No |
| DELETE | `/staff-assignments/:id` | Delete assignment | No |

#### 👨‍👩‍👧 Adoptions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/adoptions` | Get all adoptions | No |
| GET | `/adoptions/:id` | Get adoption by ID | No |
| POST | `/adoptions` | Create adoption | No |
| PUT | `/adoptions/:id` | Update adoption | No |
| DELETE | `/adoptions/:id` | Delete adoption | No |

#### 💰 Donations
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/donations` | Get all donations | No |
| POST | `/donations` | Record donation | No |

#### 📅 Schedule/Tasks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/schedule` | Get all tasks | No |
| GET | `/my-schedule` | Get user's tasks | Yes |
| POST | `/schedule` | Create task | No |
| PATCH | `/schedule/:id/complete` | Mark complete | Yes |
| DELETE | `/schedule/:id` | Delete task | No |

#### 📊 Reports
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reports/child-welfare` | Child welfare report | No |
| GET | `/reports/educational-performance` | Education report | No |
| GET | `/reports/health-records` | Health report | No |

#### 📧 Inquiries
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/inquiries` | Submit inquiry | No |
| GET | `/inquiries` | Get all inquiries | No |

### Example API Calls

#### Register User
```javascript
fetch('http://localhost:8000/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'Public'
  })
})
```

#### Add Child with Photo
```javascript
const formData = new FormData();
formData.append('first_name', 'Emma');
formData.append('last_name', 'Smith');
formData.append('date_of_birth', '2015-05-15');
formData.append('age', 9);
formData.append('gender', 'Female');
formData.append('admission_date', '2024-01-01');
formData.append('photo', fileInput.files[0]);

fetch('http://localhost:8000/api/children', {
  method: 'POST',
  body: formData
})
```

#### Send Message (Authenticated)
```javascript
fetch('http://localhost:8000/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': '<sender_user_id>'
  },
  body: JSON.stringify({
    receiver_id: '<receiver_user_id>',
    message_text: 'Hello, this is a test message'
  })
})
```

## 🖥️ Frontend Pages

### Public Pages
- **`home.html`** - Landing page with hero slider and featured children
- **`about.html`** - About the orphanage
- **`children.html`** - List of all children (limited access)
- **`child-details.html`** - Detailed child information
- **`contact.html`** - Contact form and information

### Authentication
- **`Views/login.html`** - User login
- **`Views/register.html`** - New user registration

### Admin Dashboard (`Views/`)
- **`admin_dashboard.html`** - Main admin dashboard
- **`manage_users.html`** - User management
- **`child_records.html`** - Child record management
- **`health_records.html`** - Health record management
- **`educational_management.html`** - Educational records
- **`manage_adoptions.html`** - Adoption management
- **`manage_donation.html`** - Donation management
- **`schedule_work.html`** - Task scheduling
- **`messages.html`** - Internal messaging
- **`view_inquiries.html`** - View public inquiries
- **`generate_reports.html`** - Generate reports

### Staff Dashboard (`Views/`)
- **`staff_dashboard.html`** - Main staff dashboard
- **`staff_child_management.html`** - Child management for staff

### Donation
- **`Views/donation.html`** - Public donation page

### Common Components
- **`Views/navbar.html`** - Navigation bar (admin)
- **`Views/mnavbar.html`** - Navigation bar (staff)
- **`Views/footer.html`** - Footer (admin)
- **`Views/mfooter.html`** - Footer (staff)

## 🗄️ Database Models

### User
```javascript
{
  name: String,
  username: String (unique, required),
  email: String (unique, required),
  phone_number: String,
  gender: Enum ['Male', 'Female', 'Other'],
  password: String (required),
  role: Enum ['Admin', 'Staff', 'Public', 'Medical', 'Educational'],
  timestamps: true
}
```

### Child
```javascript
{
  first_name: String (required),
  last_name: String (required),
  date_of_birth: Date (required),
  age: Number (required),
  gender: Enum ['Male', 'Female', 'Other'],
  admission_date: Date (default: now),
  photo_url: String (default: '/img/default_avatar.png'),
  timestamps: true
}
```

### HealthRecord
```javascript
{
  child_id: ObjectId (ref: 'Child', required),
  medical_history: String (required),
  vaccinations: String (required),
  treatments: String (required),
  last_checkup: Date (required),
  next_appointment: Date (required),
  timestamps: true
}
```

### EducationalRecord
```javascript
{
  child_id: ObjectId (ref: 'Child', required),
  school_name: String (required),
  grade: String (required),
  class: String (required),
  performance: String (required),
  attendance: String (required),
  extracurricular_activities: String (required),
  timestamps: true
}
```

### Message
```javascript
{
  sender_id: ObjectId (ref: 'User', required),
  receiver_id: ObjectId (ref: 'User', required),
  message_text: String (required),
  sent_at: Date (default: now)
}
```

### StaffAssignment
```javascript
{
  staff_id: ObjectId (ref: 'User', required),
  child_id: ObjectId (ref: 'Child', required),
  assigned_at: Date (default: now),
  unique: [staff_id, child_id]
}
```

### Adoption
```javascript
{
  child_id: ObjectId (ref: 'Child', required, unique),
  adopter_name: String (required),
  adopter_contact: String (required),
  adopter_nid: String (required),
  adoption_date: Date (default: now),
  timestamps: true
}
```

### Donation
```javascript
{
  donor_name: String (required),
  donor_email: String,
  amount: Number (required),
  frequency: Enum ['one-time', 'monthly'],
  date: Date (default: now),
  status: Enum ['Completed', 'Pending', 'Failed', 'Refunded'],
  transaction_id: String (unique),
  timestamps: true
}
```

### Schedule (Task)
```javascript
{
  staffId: ObjectId (ref: 'User', required),
  taskDescription: String (required),
  dueDate: Date,
  status: Enum ['pending', 'completed'],
  dateAssigned: Date (default: now),
  dateCompleted: Date,
  assignedBy: ObjectId (ref: 'User'),
  timestamps: true
}
```

### Document
```javascript
{
  child_id: ObjectId (ref: 'Child', required),
  filename: String (required),
  path: String (required),
  mimetype: String (required),
  uploadDate: Date (default: now)
}
```

### Inquiry
```javascript
{
  name: String (required),
  email: String (required),
  subject: String (required),
  message: String (required),
  childId: ObjectId (ref: 'Child'),
  status: Enum ['New', 'Responded', 'Closed'],
  receivedAt: Date (default: now),
  timestamps: true
}
```
**Made with ❤️ for a better future for children**

*Last Updated: December 2024*