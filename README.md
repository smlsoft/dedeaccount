# dedeaccount

DEDE Account - ระบบบัญชีออนไลน์

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

---

## 🚀 Firebase Hosting Deployment

### Firebase Configuration

- **Firebase Project**: `dedepos`
- **Hosting Site**: `dedeaccount-dev-2`
- **Production URL**: https://dedeaccount-dev-2.web.app
- **Firebase Console**: https://console.firebase.google.com/project/dedepos

### Prerequisites

1. Install Firebase CLI (if not already installed):
```sh
npm install -g firebase-tools
```

2. Login to Firebase:
```sh
firebase login
```

3. Verify you're using the correct project:
```sh
firebase use
# Should show: Active Project: dedepos
```

### Deploy to Firebase Hosting

#### Quick Deploy (Build + Deploy)

**Production:**
```sh
npm run deploy
# or
npm run build && firebase deploy --only hosting
```

**Development:**
```sh
npm run deploy:dev
# or
npm run build:dev && firebase deploy --only hosting
```

**Staging:**
```sh
npm run deploy:staging
# or
npm run build:staging && firebase deploy --only hosting
```

#### Step by Step

1. Build the project:
```sh
# Production build
npm run build

# Development build
npm run build:dev

# Staging build
npm run build:staging

# Loser build
npm run build:loser
```

2. Deploy to Firebase:
```sh
firebase deploy --only hosting
```

3. Deploy to specific site:
```sh
firebase deploy --only hosting:dedeaccount-dev-2
```

### Switch Firebase Projects

```sh
# List all projects
firebase projects:list

# Use dedepos project (default)
firebase use dedepos

# Use dev project (if available)
firebase use dev
```

### View Deployment History

```sh
# View hosting logs
firebase hosting:logs

# List all hosting sites
firebase hosting:sites:list
```

### Preview Before Deploy (Optional)

```sh
# Preview build locally
npm run preview

# Deploy to preview channel
firebase hosting:channel:deploy preview
```

### Rollback Deployment

If you need to rollback to a previous version:
1. Go to [Firebase Console](https://console.firebase.google.com/project/dedepos/hosting/sites)
2. Select `dedeaccount-dev-2` site
3. Go to **Release history**
4. Click on previous version and **Rollback**

---

## 🐳 Docker Deployment

### Build Docker Image

```sh
# Build and push to Docker Hub
make build_docker_image

# Build for M1 Mac (releases)
make build_m1_docker_releases

# Build for loser app
make build_loser_app
```

### Run Docker Container Locally

```sh
# Run web docker
make run_web_docker

# Or manually
docker run --rm -p 8001:80 smlsoft/dedeaccount
```

---

## 📝 Environment Variables

The project uses different environment files:

- `.env` - Development (default)
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.loser` - Loser app environment

### Key Environment Variables

```
BASE_URL=/
VUE_APP_API=https://api.dev.dedepos.com/
VUE_APP_URL=https://account.dev.dedepos.com
VUE_APP_TITLE="DEDE ACCOUNT"
VUE_APP_DATE="th"
```

### Build with Different Environments

```sh
# Build for production (default)
npm run build

# Build for development
npm run build:dev

# Build for staging
npm run build:staging

# Build for loser
npm run build:loser
```

### Deploy with Different Environments

```sh
# Deploy production
npm run deploy

# Deploy development
npm run deploy:dev

# Deploy staging
npm run deploy:staging

# Deploy to preview channel
npm run deploy:preview
```

---

## 🔑 Firebase Authentication Setup

If deploying to a new domain, you need to add it to Firebase authorized domains:

1. Go to [Firebase Authentication Settings](https://console.firebase.google.com/project/dedepos/authentication/settings)
2. Click on **Authorized domains** tab
3. Click **Add domain**
4. Add your domain (e.g., `dedeaccount-dev-2.web.app`)
5. Click **Add**

This is required for Google OAuth login to work.

---

## 📚 Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Vite Documentation](https://vitejs.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [PrimeVue Documentation](https://primevue.org/)

---

## 🛠️ Troubleshooting

### Firebase Login Issues

```sh
# Logout and login again
firebase logout
firebase login
```

### Build Errors

```sh
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Deploy Permission Errors

Make sure you have the correct permissions in the Firebase project. Contact the project administrator if needed.

---

## 📧 Support

For issues or questions, please contact the development team.
