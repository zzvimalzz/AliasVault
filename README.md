# AliasVault

A modern, privacy-focused email alias management system. **Fork and deploy in 3 steps!**

[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)](https://github.com/yourusername/AliasVault/fork)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 3-Step Setup (5 Minutes)

### Step 1: Fork This Repo
Click the **Fork** button at the top right of this page.

### Step 2: Add Cloudflare API Token
1. Get token from [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use template: **Edit Cloudflare Workers**
   - Click "Create Token" and **copy it**
2. In your forked repo: **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: Paste your token
   - Click "Add secret"

### Step 3: Wait & Visit
1. Go to **Actions** tab - deployment starts automatically
2. Wait ~3 minutes for green ✓
3. Go to **Settings** → **Pages** → Enable from **gh-pages** branch
4. Visit `https://YOUR_USERNAME.github.io/AliasVault`
5. Complete setup wizard:
   - Set admin password
   - Enter Addy.io API key (from [app.addy.io/settings/api](https://app.addy.io/settings/api))
   - Click "Complete Setup"

**Done! 🎉** Start managing your email aliases!

## ✨ Features

- 🔐 **Zero Config** - Auto-detects your GitHub username and URLs
- 📧 **Full Alias Management** - Create, enable, disable, delete
- 🎨 **Premium Dark UI** - Beautiful card-based layout (5 per row)
- 💾 **Smart Metadata** - Store service names, URLs, categories
- 🔄 **Real-time Sync** - Instant updates with Addy.io
- ⚙️ **Settings Page** - Update credentials anytime
- 🚀 **Auto Deploy** - Just push to update

## 📱 Usage

### Dashboard
View all your aliases in clean cards - see status, service, and creation date at a glance.

### Create Alias
- Enter local part (e.g., "amazon")
- Select domain from dropdown
- Choose recipients (checkboxes)
- Add optional URL and description
- Click "Create Alias"

### Manage
- **Enable/Disable** - One-click toggle
- **Delete** - Remove unused aliases
- **Settings** - Update password or API key

## 🏗️ How It Works

```
GitHub Pages (Your Frontend)
        ↓
Cloudflare Worker (Your Private API)
        ↓
┌────────────────┬──────────────────┐
│  Cloudflare KV │    Addy.io API   │
│   (Settings)   │    (Aliases)     │
└────────────────┴──────────────────┘
```

**Everything is yours:**
- Worker deployed to your Cloudflare account
- KV namespace created automatically
- No shared infrastructure

## 🔒 Security

✅ All credentials encrypted in your Cloudflare KV  
✅ JWT authentication (1-hour expiry)  
✅ Rate limiting (5 login attempts per 15 min)  
✅ CORS protection for GitHub Pages only  
✅ No secrets in code  

## 🛠️ Local Development

```bash
# Backend
cd AliasVault/backend
npm install
npm run dev  # http://localhost:8787

# Frontend
cd AliasVault/frontend
npm install
npm run dev  # http://localhost:5173
```

## 🔧 Troubleshooting

**Deployment failed?**
- Check CLOUDFLARE_API_TOKEN is correct
- View error in Actions tab → Latest workflow

**Can't access?**
- Wait 3-5 minutes after first deploy
- Check GitHub Pages is enabled (gh-pages branch)
- Clear browser cache

**Can't login?**
- Make sure you completed setup wizard first
- Check browser console (F12) for errors
- Verify worker deployed: `https://aliasvault-api-YOUR_USERNAME.workers.dev/health`

## 📝 Updates

To update your installation:
```bash
git pull upstream main
git push
```

GitHub Actions deploys automatically!

## 📝 License

MIT - Use freely!

[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)](https://github.com/yourusername/AliasVault)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

- 🔐 **Secure Setup Wizard** - No manual configuration needed
- 📧 **Full Alias Management** - Create, enable, disable, delete
- 🎨 **Premium Dark UI** - Beautiful card-based layout
- 💾 **Smart Metadata** - Store service names, URLs, categories
- 🔄 **Real-time Sync** - Instant updates with Addy.io
- ⚙️ **Easy Settings** - Update credentials anytime
- 🚀 **Zero Config Deploy** - GitHub Actions handles everything

## 🚀 Quick Start

**See [SETUP.md](SETUP.md) for detailed instructions**

1. Fork this repo
2. Create Cloudflare KV namespace
3. Add `CLOUDFLARE_API_TOKEN` to GitHub Secrets
4. Update `wrangler.toml` and `api.ts` with your info
5. Push to deploy
6. Visit GitHub Pages URL and complete setup wizard

That's it! 🎉

## 📸 Screenshots

### Setup Wizard
First-time setup in under 2 minutes - no terminal commands needed!

### Dashboard
Clean card layout showing all your aliases at a glance.

### Create Alias
Choose domain, recipients, and add metadata - all in one form.

## 🏗️ Architecture

```
GitHub Pages (Frontend)
        ↓
Cloudflare Worker (Backend API)
        ↓
┌────────────────┬──────────────────┐
│  Cloudflare KV │    Addy.io API   │
│   (Settings)   │    (Aliases)     │
└────────────────┴──────────────────┘
```

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Cloudflare Workers + TypeScript
- Storage: Cloudflare KV + localStorage
- API: Addy.io REST API v1

## 🔒 Security

✅ Encrypted credential storage (Cloudflare KV)  
✅ JWT authentication (1-hour expiry)  
✅ Rate limiting (5 login attempts per 15 min)  
✅ CORS protection  
✅ No secrets in code or git  
✅ Minimum 8-character passwords  

## 🛠️ Development

```bash
# Backend
cd AliasVault/backend
npm install
npm run dev

# Frontend
cd AliasVault/frontend  
npm install
npm run dev
```

## 📝 License

MIT - Use freely!
