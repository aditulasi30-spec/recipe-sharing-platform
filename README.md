# Online Recipe Sharing Platform (MERN)

A full-stack web app to create, share, discover and manage recipes.
**Stack:** MongoDB · Express.js · React (Vite) · Node.js · JWT authentication

**Features:** register/login (hashed passwords + JWT), add/edit/delete your own recipes (owner-only),
search by name/ingredient, filter by category and cuisine, ratings, comments, saved recipes,
user profile page, responsive UI.

## Project structure

```
recipe-sharing-platform/
├── server/            Express API + MongoDB models
│   ├── models/        User, Recipe, Comment, Favorite
│   ├── routes/        auth, recipes, users
│   ├── middleware/    JWT auth
│   └── server.js
├── client/            React frontend (Vite)
│   └── src/pages, components, AuthContext.jsx, api.js
└── package.json       root scripts (run both together)
```

## Run locally in VS Code

**Prerequisites:** [Node.js 18+](https://nodejs.org), and MongoDB — either
[MongoDB Community](https://www.mongodb.com/try/download/community) installed locally,
or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

1. Open the `recipe-sharing-platform` folder in VS Code (**File → Open Folder**), then open the terminal (**Ctrl + `**).
2. Install everything:
   ```bash
   npm run install-all
   ```
3. Create the server config: copy `server/.env.example` to `server/.env` and edit it:
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/recipe_platform
   JWT_SECRET=any_long_random_string
   ```
   (For Atlas, paste your Atlas connection string into `MONGO_URI`.)
4. Start backend + frontend together:
   ```bash
   npm run dev
   ```
5. Open **http://localhost:5173**. Register an account, add a recipe, and try search, ratings and comments.

The frontend proxies `/api` requests to the backend on port 5000 during development.

## Put the code on GitHub

1. Create an empty repository on GitHub (no README/.gitignore), e.g. `recipe-sharing-platform`.
2. In the VS Code terminal, from the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Online Recipe Sharing Platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/recipe-sharing-platform.git
   git push -u origin main
   ```
3. Your repository link is `https://github.com/<your-username>/recipe-sharing-platform`.

`.env` is git-ignored, so your secrets are never uploaded.

## Make it live (free hosting on Render + MongoDB Atlas)

The Express server also serves the built React app, so one deployment runs everything.

1. **Database:** create a free cluster at MongoDB Atlas → Database Access: add a user →
   Network Access: allow `0.0.0.0/0` → Connect → copy the connection string
   (replace `<password>`, and add a database name like `/recipe_platform`).
2. **Deploy:** on [render.com](https://render.com) choose **New → Web Service**, connect your GitHub repo, and set:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment variables:** `MONGO_URI` (your Atlas string), `JWT_SECRET` (long random string)
3. Click deploy. Render gives you a public URL such as `https://recipe-sharing-platform.onrender.com`.
   Add that live link to your GitHub repo's description and to this README.

> Free Render services sleep when idle, so the first request after a pause can take about a minute.

## REST API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Log in, returns JWT |
| GET | `/api/recipes?search=&category=&cuisine=&author=` | – | List / search / filter |
| GET | `/api/recipes/:id` | – | Recipe details |
| POST | `/api/recipes` | ✔ | Add recipe |
| PUT | `/api/recipes/:id` | ✔ owner | Edit recipe |
| DELETE | `/api/recipes/:id` | ✔ owner | Delete recipe |
| POST | `/api/recipes/:id/rate` | ✔ | Rate 1–5 |
| POST | `/api/recipes/:id/favorite` | ✔ | Toggle saved recipe |
| GET/POST | `/api/recipes/:id/comments` | POST ✔ | Read / add comments |
| GET | `/api/users/me/favorites` | ✔ | My saved recipes |
| GET/PUT | `/api/users/:id` | PUT ✔ self | Profile |

## Author

A. Tulasi — Roll No. 24D01A66C1
