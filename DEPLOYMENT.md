# Deployment Guide: React Frontend & Node.js Express Backend

This guide explains how to deploy the decoupled InsideIIM Investment Research Agent. 

Since the application uses **Server-Sent Events (SSE)** to stream logs and research steps in real time, the Express backend requires a persistent Node.js connection. We highly recommend deploying the **Frontend on Vercel** and the **Backend on Render** (both are free and standard industry choices).

---

## Recommended Setup: Frontend (Vercel) + Backend (Render)

This setup ensures that the streaming SSE connections work perfectly without hitting Serverless timeouts.

### Part 1: Deploy the Node.js Backend on Render.com (Free)

1. **Create a GitHub Repository**:
   - Push your code to a private or public GitHub repository.

2. **Sign up on Render**:
   - Go to [Render.com](https://render.com) and sign up (you can link your GitHub account).

3. **Create a New Web Service**:
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository.

4. **Configure Web Service Settings**:
   - **Name**: `insideiim-backend` (or any name you prefer)
   - **Root Directory**: `backend` (very important: set this to the backend subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Select the **Free** plan.

5. **Environment Variables**:
   - Click the **Environment** tab on Render.
   - (Optional) Add your API keys if you want them configured server-side:
     - `GEMINI_API_KEY`: *your_api_key*
     - `TAVILY_API_KEY`: *your_api_key*
     - `OPENAI_API_KEY`: *your_api_key*

6. **Deploy**:
   - Click **Create Web Service**. Render will build and deploy your Express server.
   - Once deployed, copy your backend URL (e.g., `https://insideiim-backend.onrender.com`).

---

### Part 2: Deploy the React Frontend on Vercel (Free)

1. **Update Frontend API Endpoint**:
   - Since the backend is now hosted on Render, you can tell the frontend to query your Render URL instead of the local server.
   - In `frontend/src/App.tsx`, we already configured:
     `const backendUrl = "https://your-backend-url.onrender.com";`
   - Alternatively, you can pass this as an environment variable `VITE_API_URL` during Vercel build configuration.

2. **Sign up on Vercel**:
   - Go to [Vercel.com](https://vercel.com) and log in.

3. **Import New Project**:
   - Click **Add New** -> **Project**.
   - Connect your GitHub repository.

4. **Configure Project Settings**:
   - **Framework Preset**: Select **Vite** (Vercel will detect this automatically).
   - **Root Directory**: `frontend` (very important: select the frontend subdirectory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Set Environment Variables**:
   - Expand the **Environment Variables** section.
   - Add the following variable:
     - **Key**: `VITE_API_URL`
     - **Value**: *Paste your Render backend URL here* (e.g. `https://insideiim-backend.onrender.com`)

6. **Deploy**:
   - Click **Deploy**. Vercel will bundle your React app and provide you with a live hosting link (e.g., `https://insideiim-frontend.vercel.app`).

---

## Alternative: Serverless Monorepo Deployment (Vercel Only)

If you strictly want to deploy both frontend and backend on Vercel as a single project using Vercel Serverless Functions, follow these steps:

### 1. Re-route Express to Vercel Serverless
Vercel handles serverless functions through an `/api` folder at the root of the project.
To deploy:
- Create a `vercel.json` at the root of your project:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/research" }
  ]
}
```
- Note that Vercel serverless functions have a **10-second timeout limit** on the free tier and **buffer response chunks**, which means the real-time logging stream might load all at once at the end instead of printing live. This is why the Render + Vercel setup is highly recommended for streaming applications!
