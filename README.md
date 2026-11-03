# T-Minus Countdown: Lock Screen Studio
### Built for the Handshake × Gemini Challenge

A client-side planning dashboard, custom lock screen designer, and calendar reminder exporter designed for the **Handshake × Google Challenge: "Your Deadline, Your Design"**.

---

## 🌟 Overview & Features

This static web application provides:
1. **Backward Milestone Planner (Step I):**
   - Calculates milestone dates (T-14, T-7, T-3, T-1, T-0) working backward from any target deadline date.
   - Enforces a 4-word maximum limit per milestone (strictly under five words). Overdue dates are highlighted if the deadline is near.
   - Provides copyable planning prompt templates for use in Google Gemini.
2. **Lock Screen Visualizer & Canvas Generator (Step II):**
   - Supports 9:16 phone lock screens and 16:9 laptop wallpapers.
   - Leaves clean top space for phone clocks, date displays, and status icons.
   - Renders high-resolution wallpapers (1080×1920 for phone, 1920×1080 for laptop) via client-side HTML5 Canvas.
   - Blocks export if any milestone exceeds the 4-word maximum.
   - Offers theme presets: Obsidian Cyber, Warm Botanical, Neon Sunset, and Minimal Swiss.
3. **Calendar Automation (Step III):**
   - Exports downloadable `.ics` calendar files with timed floating local events (09:00 - 09:30 by default).
   - Configures `TRIGGER:PT0S` alarm notifications to fire on the milestone day at the user's chosen reminder time.
   - Provides copyable daily push reminder prompts designed for Google Gemini.

---

## ⚠️ Limitations

- **No External API Calls:** The web application is 100% client-side HTML/CSS/JavaScript. It does not call the Google Gemini API, Imagen, or any external service.
- **No Direct Submissions:** The application cannot directly submit projects to Handshake. Contest submissions must be completed manually on the official Handshake challenge portal.
- **Calendar Reminders:** Reminders are exported as standard `.ics` calendar files for manual import into Google Calendar or Apple Calendar.

---

## 📂 Project Structure

```
countdown-lock-screen-studio/
├── assets/                           # Optional exported lock screen images (placeholder shown if missing)
├── index.html                        # Main web application
├── style.css                         # Layout and glassmorphism styling
├── app.js                            # Interactive logic, Canvas export, and .ICS generation
├── reminders.ics                     # Static default calendar file (AI-901 Exam)
├── GEMINI_PROMPTS.md                 # Prompts for Gemini & placeholder for real chat
├── SUBMISSION_READY.md               # Handshake submission guide & pitch template
└── README.md                         # Documentation
```

---

## 🚀 How to Run Locally

### Option 1: Direct File Open
Open `index.html` directly in any web browser (Chrome, Edge, Firefox, Safari). All assets and links use relative paths, so the app runs without a local server.

### Option 2: Local HTTP Server
Run with Python:
```bash
python -m http.server 8080
```
Then navigate to `http://localhost:8080`.

---

## 🌐 Deploy on GitHub Pages

Because the app is fully static with relative paths and no build step, you can host it on GitHub Pages in seconds:

1. Push this folder to a GitHub repository (e.g. `main` branch).
2. On GitHub, navigate to **Settings** > **Pages** (under "Code and automation").
3. Under **Build and deployment** > **Branch**, select `main` (or default branch) and `/ (root)` folder.
4. Click **Save**.
5. Within 1–2 minutes, GitHub will provide your live URL (e.g., `https://<username>.github.io/<repo-name>/`).
