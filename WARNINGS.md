# ⚠️ Warnings & Limitations

Before deploying or using this Shared AI Memory MCP server, please read the following limitations carefully.

### 1. Free Tier "Cold Starts" (Render)
If you are hosting this on Render's Free Tier, the server will go to "sleep" after 15 minutes of inactivity. 
* **The Symptom:** When you open Claude and try to use a memory tool after being away for a while, it might time out or fail.
* **The Fix:** Simply wait 45-60 seconds for the server to wake up, and ask Claude to try again. 

### 2. Secret Key Management
Never commit your `.env` file to GitHub. If you accidentally leak your `SUPABASE_SERVICE_ROLE_KEY` or `TOKEN_ENCRYPTION_KEY`, anyone can read, modify, or delete your saved AI memories.
* Always rotate your keys immediately if they are exposed.
* Use cryptographically secure random strings for your encryption keys (e.g., `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).

### 3. Personal Data Privacy
This server allows AI models (like Claude) to permanently store and retrieve context about your life, projects, and preferences. 
* Be mindful of asking the AI to save highly sensitive personal data (e.g., bank details, SSNs) unless you are entirely confident in your database's security rules.
* You own the database (via Supabase), meaning Anthropic does not have direct access to your database, but the data is transmitted to them during active chat sessions.

### 4. Single-User Design
Currently, the OAuth implementation utilizes an in-memory Map for temporary authorization codes. This is perfectly stable for a single user on a single server instance. If you intend to scale this for hundreds of users across multiple server instances, you must migrate the OAuth storage (clients, auth codes, and access tokens) to a persistent database like Supabase/Redis.