# 🧠 Shared AI Memory MCP Server

This project gives Claude a custom Model Context Protocol (MCP) server so it can keep persistent memory across chats, with the data stored safely in your own Supabase database and deployed from your GitHub repository.

## What this repo is for

You should keep this project in a GitHub repo, push changes with `git`, and deploy that repo on Render, because Render will build directly from GitHub and Claude will connect to the live Render URL.

---

## Prerequisites

Before you start, make sure you have:

- A GitHub account
- A Render account
- A Supabase account
- Node.js installed locally
- Git installed locally
- A terminal on your computer
- Access to the project files in this repository

---

## 1) Set up the database in Supabase

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Open **Project Settings > API** and copy these values:
   - Your **Project URL**
   - Your **`service_role` secret key**
3. Keep the `service_role` key private, because it should never be exposed in frontend code or committed into GitHub.
4. Open the **SQL Editor** in Supabase and run the database migrations from the `src/db/migrations` folder in this repository.
5. These migrations create the tables and database structure needed for storing memory properly.

---

## 2) Prepare the project locally

1. Fork or clone this repository to your computer.
2. Open a terminal in the project folder.
3. Install dependencies:

```bash
npm install
```

4. Generate two secure random keys by running this command **twice**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

5. Save both values somewhere safe, and make sure they are different from each other:
   - One key will be used as your **MCP token**.
   - The other key will be used as your **encryption key**.

---

## 3) Push the project to GitHub using git

If this project is not already linked to a GitHub repository, initialize it and push it like this:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

If the repository already exists, just make sure your latest changes are committed and pushed to the correct remote.

> **Note:** Your `.env` file should stay local and should not be committed to GitHub.

---

## 4) Deploy on Render

1. Go to [Render](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service with these settings:
   - **Build Command:**
     ```bash
     npm install --include=dev && npm run build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
4. Add these environment variables in Render:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `DATABASE_PROVIDER=supabase`
   - `SUPABASE_URL=YOUR_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY`
   - `MEMORY_MCP_TOKEN=YOUR_FIRST_SECURE_KEY`
   - `TOKEN_ENCRYPTION_KEY=YOUR_SECOND_SECURE_KEY`
5. Double-check that the Supabase values and the two generated secrets are pasted correctly.
6. Deploy the service and wait until Render shows that it is live.
7. Copy your Render server URL, for example:
   `https://your-server-name.onrender.com`

---

## 5) Connect Claude to the MCP server

1. Open [Claude.ai](https://claude.ai) in your browser.
2. Click your profile icon in the bottom left.
3. Open **Settings**.
4. Go to **Connectors**.
5. Click **Add custom connector**.
6. In the URL field, paste your Render URL and append `/mcp` at the end.
   - Example: `https://your-server-name.onrender.com/mcp`
7. Open **Advanced Settings** and leave the OAuth fields completely blank.
   - *The server handles Dynamic Client Registration automatically, so you do not need to fill those fields in yourself.*
8. Click **Connect**.
9. A new tab will open asking you to **Approve Access**.
10. Click **Approve Access**.
11. The tab will close, and Claude should show a green connected status.

---

## 6) Test that memory is working

After the connector is live, open a new Claude chat and send something like this:

> "Save a core memory: My favorite programming language is TypeScript."

If everything is working correctly, Claude should store it and be able to recall it in later chats.

---

## 7) Troubleshooting and free tier notes

### Connection expired or timeout
If you are using Render’s free tier, the server may go to sleep after about 15 minutes of inactivity. When you send your first message after a break, the connection may fail or time out because the server takes time to wake up.
* **Fix:** Wait about a minute and try again.

### Code expired or invalid during OAuth
OAuth codes are one-time use, so refreshing the approval page can break the flow.
* **Fix:** Close the tab, delete the pending connection in Claude, and add the connector again.

### Deploy failed
If deployment fails, check your Render build command carefully. It must include `--include=dev` so that development dependencies like `@types/node` are installed for the TypeScript compiler.

### Connector will not connect
If Claude is not connecting, check these things:
- [ ] The Render URL is correct.
- [ ] `/mcp` is added at the end of the URL.
- [ ] OAuth fields in Advanced Settings are blank.
- [ ] The environment variables are pasted exactly.
- [ ] The service is actually live on Render.

---

## Repository notes

To keep this project safe and easy to maintain:
- Do not commit your `.env` file.
- Do not commit secrets to GitHub.
- Keep your Render environment variables updated if you change keys.
- Make sure your migrations stay in the repository.
- Update the README if your setup changes later.

---

## Quick checklist
- [ ] Supabase project created
- [ ] Database migrations applied
- [ ] Two secure keys generated
- [ ] Project pushed to GitHub with `git`
- [ ] Render service connected to the GitHub repo
- [ ] Environment variables added in Render
- [ ] Build command set correctly
- [ ] Start command set correctly
- [ ] Claude connector added with `/mcp`
- [ ] OAuth fields left blank in Advanced Settings
- [ ] Connection approved successfully
- [ ] Memory test message sent in Claude

## Final result

Once everything is connected, Claude will have persistent memory through your MCP server and Supabase database, and your project will be deployed cleanly from GitHub using `git`.
