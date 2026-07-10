# Deployment Guide: Unified Vercel Deployment

This guide explains how to deploy the entire InsideIIM Investment Research Agent (both React Frontend and Node.js Backend) as a **single, unified project on Vercel**.

By using Vercel Serverless Functions, you do not need to sign up for Render.com or manage separate API URLs! The backend routes are hosted directly under the same domain.

---

## Single-Click Deployment on Vercel

1. **Go to Vercel**:
   - Open your browser and navigate to [Vercel.com](https://vercel.com).
   - Sign in using your **GitHub account**.

2. **Import Repository**:
   - Click the **"Add New..."** button in the top-right corner and select **"Project"**.
   - Find your **`InsideIIM`** repository in the list and click **"Import"**.

3. **Configure Project Settings**:
   - **Framework Preset**: Keep it as **Other** or **Vite** (Vercel will auto-configure based on `vercel.json` and `package.json` at the root).
   - **Root Directory**: **Keep this blank (the root directory)**. Do NOT choose `frontend` or `backend`! We have configured the root `vercel.json` to coordinate both directories automatically.

4. **Add Environment Variables (Optional)**:
   - Expand the **Environment Variables** section if you wish to configure API keys on the server-side:
     - `GEMINI_API_KEY`: *your_api_key*
     - `TAVILY_API_KEY`: *your_api_key*
     - `OPENAI_API_KEY`: *your_api_key*
   - *Note: You can also choose not to set these here, and instead enter them inside the browser modal ("Configure Keys") when viewing your live website.*

5. **Deploy**:
   - Click the **"Deploy"** button.
   - Vercel will install the dependencies, build the React client (placing it in the `dist` directory), spin up the serverless backend function, and provide you with a single live shareable link (e.g. `https://inside-iim.vercel.app`)!

---

## Technical Details (Under the Hood)
We have pre-configured the following integration files in your repository:
* **[vercel.json](file:///c:/Users/hp/OneDrive/Desktop/Trevel/insideiim/vercel.json)**: Instructs Vercel to host the React application static files at the root `/` and route all POST requests from `/api/research` directly to the serverless function.
* **[api/research.js](file:///c:/Users/hp/OneDrive/Desktop/Trevel/insideiim/api/research.js)**: Runs the LangGraph AI agent inside Vercel's serverless runtime.
