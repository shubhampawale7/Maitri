# Maitri - A Modern Real-Time Chat Application

<p align="center">
  <img src="file:///C:/Users/LENOVO/Desktop/Client%20Projects/Maitri/client/public/file.svg" alt="Maitri Logo" width="150">
</p>

<h3 align="center">
  Connect, share, and communicate with confidence. Maitri is a full-featured, real-time messaging platform built with a modern technology stack, focusing on a beautiful user experience and advanced functionality.
</h3>

<p align="center">
  <strong>Live Demo (Frontend on Vercel):</strong> <a href="#">[Your Vercel Link Here]</a>  
  <br />
  <strong>Backend API (on Render):</strong> <a href="#">[Your Render Link Here]</a>
</p>

---

## ✨ Key Features

Maitri is more than just a chat app — it's a complete communication suite designed for the modern web.

- **💬 Real-Time Messaging**  
  Instant one-on-one and group messaging powered by Socket.IO.

- **📷 Rich Media Sharing**  
  Share images and videos seamlessly in any conversation.

- **🎯 Advanced Chat UI**

  - Typing indicators
  - Read receipts for 1-on-1 chats
  - Reply and delete messages
  - Full emoji picker
  - Sound notifications

- **👥 Group Chat Management**

  - Create/rename groups
  - Change group icons
  - Add/remove participants (admin-only)

- **📸 Ephemeral Stories**  
  Share photos/videos that disappear after 24 hours.

- **🧑‍💻 User Profiles & Presence**

  - Custom profile pictures and statuses
  - Real-time “Online” & “Last Seen” indicators

- **🎨 Modern, Responsive UI/UX**

  - Light/Dark mode toggle
  - Smooth animations (Framer Motion)
  - Fully responsive across devices

- **🔒 Secure Authentication**  
  JWT-based auth with secure cookies

---

## 🛠️ Technology Stack

### **Frontend**

- **Framework:** React 18 + Vite
- **State Management:** Redux Toolkit
- **Data Fetching:** TanStack Query (React Query)
- **Styling:** Tailwind CSS (Themeable)
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Realtime:** Socket.IO Client
- **UI Components:** Headless UI

### **Backend**

- **Framework:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Realtime:** Socket.IO
- **Auth:** JWT + bcryptjs
- **Media Storage:** Cloudinary
- **File Uploads:** multer

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js (v18+)
- npm or yarn
- MongoDB (Local or Cloud)
- Cloudinary Account

---

### 🔧 Installation & Setup

#### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/maitri.git
cd maitri
```

#### **2. Backend Setup**

```bash
cd server
npm install
```

Create a `.env` file in the `/server` folder with:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the server:

```bash
npm run dev
```

#### **3. Frontend Setup**

```bash
cd ../client
npm install
npm run dev
```

> The frontend will run at `http://localhost:5173` and backend at `http://localhost:5000`.

## 🚧 Project Status

Maitri is **functionally complete** and serves as a **modern full-stack web app**.

### 🔮 Planned Enhancements:

- End-to-End Encryption (Group Chats)
- Video Calling
- Global User Search

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you’d like to change.

---

## 📄 License

Distributed under the MIT License.

---

## 💡 Inspiration

“Maitri” means **friendship** in Sanskrit — symbolizing human connection, empathy, and communication.

---

## 🛠️ Developed by

**Designed and Developed by Shubham Pawale — MERN Stack Developer**
