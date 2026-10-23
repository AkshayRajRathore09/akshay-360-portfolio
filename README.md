# Akshay · 360° Virtual Tour Portfolio

An immersive, scroll-driven interactive portfolio website showcasing 360° virtual tours, dynamic video frame scrub animation, client video testimonials, and an interactive consultation booking workflow.

---

## 🚀 Live Demo & Hosting

This project is configured for one-click deployment to **[Vercel](https://vercel.com/)** directly via **GitHub**.

### Quick Deployment to Vercel (via GitHub)

1. **Initialize Git & Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Akshay 360 Portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** → **"Project"**.
   - Select your GitHub repository.
   - **Framework Preset**: Select **"Other"** (or leave default static detection).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: Leave default or `npm run build`.
   - **Output Directory**: Leave empty / default (`./`).
   - Click **"Deploy"**.

3. Your site will be live on a `https://<project-name>.vercel.app` URL with automatic global Edge CDN acceleration, HTTPS SSL, and continuous deployment upon git push!

---

## 🛠 Local Development

To run locally:
```bash
# Using Node / npx
npm start
# or
npx serve .

# Or using Python
python -m http.server 3000
```
Then visit `http://localhost:3000`.

---

## 📁 Project Structure

```
├── index.html                   # Main semantic entry point & layout
├── styles.css                   # Responsive design system & glassmorphism theme
├── app.js                       # Canvas frame scrubber, preloader, and modal logic
├── frames/                      # 300 sequence frames (ezgif-frame-001.jpg to 300)
├── vercel.json                  # Edge caching rules and clean URL configuration
├── package.json                 # Metadata & npm scripts
├── .gitignore                   # Ignored files (zips, OS artifacts, temp logs)
├── .env.example                 # Environment variable guide
└── README.md                    # Project documentation & deployment guide
```

---

## ⚡ Features & Performance

- **Full-Screen 60FPS Canvas Scrub**: 300 video frames synced to scroll with Lerp easing.
- **Edge Cache Optimization**: JPG sequence cached with `Cache-Control: public, max-age=31536000, immutable` via `vercel.json`.
- **Preloader**: Visual counter ensuring assets are ready before playback.
- **Interactive 360° Virtual Tours**: Direct launch to live interactive spatial tours.
- **Client Testimonials**: Lazy-loaded Google Drive video modal players with zero initial page weight.
- **Consultation Booking Workflow**: Direct WhatsApp & Email inquiry dispatch.
