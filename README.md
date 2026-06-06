# 🌟 SocialHub – Mini Social Post App
> Full Stack Internship Assignment – 3W

A social media feed application inspired by the TaskPlanet Social Page, built with React, Node.js, Express, and MongoDB.

---

## 📸 Features

- **Authentication** – Signup & Login with JWT tokens
- **Create Post** – Text, image (base64), or both
- **Feed** – Public feed of all posts, newest first, with pagination
- **Like** – Toggle likes; live count updates instantly
- **Comment** – Add comments under any post; usernames saved
- **Delete** – Authors can delete their own posts
- **Responsive** – Works on mobile and desktop

---

## 🗂️ Project Structure

```
social-app/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js        # Users collection
│   │   │   └── Post.js        # Posts collection (with comments embedded)
│   │   ├── routes/
│   │   │   ├── auth.js        # /api/auth/signup, /login, /me
│   │   │   └── posts.js       # /api/posts CRUD + like/comment
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT protect middleware
│   │   └── index.js           # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── index.js       # Axios API calls
    │   ├── context/
    │   │   └── AuthContext.js # Global auth state
    │   ├── components/
    │   │   ├── CreatePost.js  # Post creation form
    │   │   └── PostCard.js    # Single post card with like/comment
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── SignupPage.js
    │   │   └── FeedPage.js    # Main social feed
    │   ├── App.js             # Routes + MUI theme
    │   └── index.js
    └── package.json
```

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React.js, Material UI (MUI)       |
| Backend   | Node.js + Express                 |
| Database  | MongoDB (2 collections)           |
| Auth      | JWT + bcryptjs                    |
| Hosting   | Vercel (FE) + Render (BE) + Atlas |

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/social-app.git
cd social-app
```

### 2. Backend setup
```bash
cd backend
npm install

# Create .env from example
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**`.env` values:**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/social-app
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev   # Starts on http://localhost:5000
```

### 3. Frontend setup
```bash
cd ../frontend
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

```bash
npm start     # Starts on http://localhost:3000
```

---

## 🌐 Deployment

### Backend → Render
1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node src/index.js`
6. Add environment variables (MONGO_URI, JWT_SECRET, FRONTEND_URL)

### Frontend → Vercel
1. Import GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add env variable: `REACT_APP_API_URL=https://your-render-app.onrender.com/api`
4. Deploy!

### Database → MongoDB Atlas
1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Add your Render IP (or `0.0.0.0/0` for all) to IP Allowlist
4. Copy connection string to `MONGO_URI`

---

## 📡 API Endpoints

| Method | Route                      | Auth | Description              |
|--------|----------------------------|------|--------------------------|
| POST   | /api/auth/signup           | No   | Register new user        |
| POST   | /api/auth/login            | No   | Login, returns JWT       |
| GET    | /api/auth/me               | Yes  | Get current user         |
| GET    | /api/posts?page=1&limit=10 | No   | Get paginated feed       |
| POST   | /api/posts                 | Yes  | Create new post          |
| DELETE | /api/posts/:id             | Yes  | Delete own post          |
| PUT    | /api/posts/:id/like        | Yes  | Toggle like              |
| POST   | /api/posts/:id/comment     | Yes  | Add comment              |
| GET    | /api/posts/:id/comments    | No   | Get post comments        |

---

## 🏆 Bonus Features Implemented

- ✅ Responsive & mobile-friendly layout
- ✅ Pagination with "Load More" button
- ✅ Image upload (base64) with preview & size validation
- ✅ Instant like/comment updates (no page refresh)
- ✅ Loading skeletons for better UX
- ✅ Clean reusable component architecture
- ✅ JWT auth with 7-day expiry
- ✅ Input validation on both frontend and backend

---

## 📬 Contact

Assignment by [Your Name]  
Submission for: 3W Full Stack Internship  
Email: hr@triplewsols.com
