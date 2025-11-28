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

Environment variable notes:
- Vite only exposes variables prefixed with `VITE_`
- `.env` changes require server restart
