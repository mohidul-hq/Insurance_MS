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
