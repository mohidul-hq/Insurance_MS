# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

# Insurance MS (React + Vite)

## Setup (Appwrite + .env)

Configure Appwrite via a `.env` file using Vite's env variables.

1. Copy `.env.example` to `.env` (or `.env.local`) and fill values:

	- `VITE_APPWRITE_ENDPOINT` — Appwrite endpoint (e.g. `https://cloud.appwrite.io/v1`)
	- `VITE_APPWRITE_PROJECT_ID` — Project ID
	- `VITE_APPWRITE_DATABASE_ID` — Database ID
	- `VITE_APPWRITE_COLLECTION_ID` — Collection ID
	- `VITE_APPWRITE_POLICY_BUCKET_ID` — Storage bucket for policy PDFs
	- `VITE_APPWRITE_KYC_BUCKET_ID` — Storage bucket for KYC images

2. Ensure your Appwrite collection has fields to store files:
	- `policyFileId` (string)
	- `kycFileId` (string, optional for backward compatibility)
	- `kycFileIds` (array of strings) for multiple images

3. Install dependencies and run:

```powershell
npm install
npm run dev
```

Build:

```powershell
npm run build
```

## Deployment (GitHub Pages)

This project is configured for GitHub Pages at `https://mohidul-hq.github.io/Insurance_MS/`.

### One-time setup
1. Ensure remote is set: `git remote -v` should show the GitHub URL.
2. Branch name is `main` (workflow triggers on it).
3. `vite.config.js` sets `base: '/Insurance_MS/'` so assets resolve correctly.

### Manual deploy

```powershell
npm run deploy
```
This builds the site and publishes the `dist` folder to the `gh-pages` branch.

### Automatic deploy (GitHub Actions)
The workflow `.github/workflows/deploy.yml` builds and deploys on every push to `main`.

### After deploying
First publish may take a couple of minutes. In the repository Settings > Pages, confirm the source is the `gh-pages` branch. Then visit:
```
https://mohidul-hq.github.io/Insurance_MS/
```

If you see 404s for assets, confirm the `base` path in `vite.config.js` matches the repository name and clear browser cache.

### Common issues
- Wrong base path: ensure `/Insurance_MS/` (case-sensitive) is used.
- Remote not set: configure with `git remote add origin https://github.com/mohidul-hq/Insurance_MS.git`.
- Old cache: force refresh (Ctrl+F5).


Environment variable notes:
- Vite only exposes variables prefixed with `VITE_`
- `.env` changes require server restart

## Authentication (Email/Password + Google OAuth)

The app now supports Appwrite authentication. Users can register with email/password or sign in via Google OAuth.

### 1. Enable Google in Appwrite Console
1. In Appwrite console: `Authentication > Providers > Google`.
2. Toggle to enable.
3. Enter Google OAuth credentials (Client ID & Client Secret) from your Google Cloud project (OAuth consent screen + Web application credentials).
4. Add allowed redirect URLs (exact matches):
	- `http://localhost:5173/oauth`
	- Production (GitHub Pages) variant if used (must point to your deployed domain), e.g. `https://mohidul-hq.github.io/Insurance_MS/oauth`
5. Save provider settings.

### 2. Environment Variables
Ensure the following are set in `.env`:
```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID
VITE_APPWRITE_DATABASE_ID=...
VITE_APPWRITE_COLLECTION_ID=...
VITE_APPWRITE_POLICY_BUCKET_ID=...
VITE_APPWRITE_KYC_BUCKET_ID=...
```

### 3. How It Works
- Email/password: `account.createEmailSession(email, password)`; registration uses `account.create('unique()', email, password, name)` and then auto-logs in.
- Google: `account.createOAuth2Session('google', successURL, failureURL)` triggers a redirect to Google; after consent Appwrite redirects back to `/oauth` where the app finalizes the session.
- Logout: `account.deleteSessions()` clears all sessions.

### 4. Frontend Components
- `AuthProvider.jsx`: React context managing user state and session restoration.
- `Login.jsx`: UI for login/register + Google button.
- `Navbar.jsx`: Shows user avatar and Logout.
- `App.jsx`: Renders `Login` until a user session exists.

### 5. Adding Other Providers
Repeat provider enable steps for GitHub, Microsoft, etc. Adjust button to call `account.createOAuth2Session('<provider>', success, failure)`.

### 6. Common Issues
| Symptom | Fix |
|--------|-----|
| Redirect loops | Ensure redirect URL exactly matches one whitelisted in Appwrite. |
| 401 after Google sign-in | Check project ID / endpoint env vars; session may target wrong project. |
| Email already exists on register | Catch error code `user_already_exists`; prompt user to sign in instead. |
| Blank page after OAuth | Confirm `/oauth` path handling in `AuthProvider.jsx` and that build base path doesn’t strip `/oauth`. |

### 7. Production Notes
If deploying to GitHub Pages, the redirect URL must include the repository sub-path. Example:
```
https://mohidul-hq.github.io/Insurance_MS/oauth
```
Add this to provider allowed redirects before testing.
