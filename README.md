# SmartLease AI - Rental Agreement Intelligence Platform

SmartLease AI is an advanced, AI-powered platform designed to revolutionize the way landlords and tenants manage and understand rental agreements. By leveraging state-of-the-art Large Language Models (LLMs), SmartLease automatically analyzes complex lease documents, extracts key information, highlights potential risks, and translates legal jargon into plain English.

## 🚀 Key Features

### 🏢 Multi-Role Ecosystem
- **Tenants**: Browse properties, send rental requests, view their lease agreements, and interact with the AI to understand their lease terms before signing.
- **Landlords**: Add and manage properties, oversee tenant applications, generate and upload lease agreements, and utilize AI tools to ensure their contracts are robust and compliant.
- **Administrators**: Full platform oversight, including global user and property management, AI usage tracking, system-wide settings, and granular role-based permissions management.

### 🤖 AI-Powered Document Analysis
- **Clause Extraction**: Automatically break down lengthy PDFs into categorized clauses (e.g., Rent, Maintenance, Termination).
- **Risk Detection**: The AI proactively scans for unusual, highly-restrictive, or legally questionable clauses that could harm the landlord or tenant.
- **Plain English Summaries**: Translates dense legal "legalese" into easily digestible summaries.
- **Interactive AI Chat**: Users can chat directly with the document. Ask questions like *"Can I keep a dog?"* or *"What is the penalty for breaking the lease early?"* and get precise, contextual answers.

### 🔒 Secure Authentication & Role Management
- **OTP-Based Verification**: Secure login, registration, and password reset flows using One-Time Passwords sent via email.
- **Role-Based Access Control (RBAC)**: Strict separation of privileges. Admins can dynamically toggle specific feature access for tenants and landlords through the Permission Management dashboard.

### 📊 Comprehensive Dashboards
- **Analytics**: Track active leases, pending requests, and monthly revenue.
- **Reminders**: Automated rent collection reminders and lease expiration alerts.
- **Feedback & Reports**: Built-in mechanisms for platform feedback and system auditing.

---

## 🛠️ Technology Stack

### Frontend
- **React.js** with **Vite**
- **React Router** for navigation
- **Tailwind CSS** for responsive, modern UI styling
- **Lucide React** for iconography

### Backend
- **Node.js** & **Express.js**
- **MongoDB** (with Mongoose) for database management
- **JWT (JSON Web Tokens)** for stateless authentication
- **Nodemailer** for OTP and notification emails
- **Bcrypt** for secure password hashing

### AI Integration
- Powered by **Google Gemini Pro** (or configured LLM) for document parsing, natural language processing, and interactive chat.

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or MongoDB Atlas)
- LLM API Key (e.g., Google Gemini API Key)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SmartLease-AI-Rental-Agreement-Intelligence-Platform
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email_for_nodemailer
EMAIL_PASS=your_email_app_password
GEMINI_API_KEY=your_gemini_api_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```
The frontend will typically run on `http://localhost:5173`.

---

## 📁 Project Structure

```
SmartLease-AI/
├── backend/
│   ├── controllers/      # Route logic (Property, Auth, AI, Admin)
│   ├── models/           # Mongoose schemas (User, Property, Agreement, Permissions)
│   ├── routes/           # Express routes mapping
│   ├── services/         # Third-party services (Email, AI integration)
│   └── index.js          # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components and Layouts
    │   ├── context/      # React Context (AuthContext)
    │   ├── pages/        # Views categorized by role (admin, landlord, tenant)
    │   ├── services/     # Axios API instances
    │   └── App.jsx       # Main routing logic
    └── tailwind.config.js
```

---

## 🛡️ Security Notes
- Passwords are never stored in plain text.
- API endpoints are protected using middleware that verifies JWT validity and user roles.
- Sensitive environment variables (Database URIs, API Keys) are strictly `.gitignore`'d.
