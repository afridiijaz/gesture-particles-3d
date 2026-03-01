# ✨ ParticleMancer

> A real-time interactive 3D particle system powered by **Three.js** and **MediaPipe Hands** — control beautiful particle formations with your bare hands!

**Repo name:** `particlemancer`
**Description:** `✨ Real-time 3D particle system controlled by hand gestures — built with Three.js & MediaPipe Hands`
**Topics:** `threejs` `mediapipe` `hand-tracking` `particles` `webgl` `javascript` `3d` `gesture-control`

![Three.js](https://img.shields.io/badge/Three.js-r152-black?logo=three.js)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-blue?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎬 Features

- 🖐 **Real-time hand tracking** via webcam using MediaPipe Hands
- 🎨 **8 stunning particle shapes**: Heart, Flower, Saturn, Firework, Spiral, Star, DNA, Galaxy
- 🌈 **7 colour themes**: Rainbow, Fire, Ocean, Neon, Gold, Aurora, Sakura
- 🤏 **Gesture controls** — expand, compress, attract, resize, and cycle shapes
- ✨ Smooth particle transitions with additive blending
- 🌌 Beautiful space background with twinkling stars
- 🎮 Orbit controls for camera movement
- ⌨️ Keyboard shortcuts for power users
- 📱 Responsive design

---

## 🤚 Gesture Controls

| Gesture | Action |
|---------|--------|
| ✊ Fist | Compress particles inward |
| 🖐 Open Hand | Expand particles outward |
| ✌️ Peace / Two | Cycle to next shape |
| 👆 Point | Attract particles toward finger |
| 🤏 Pinch | Change particle size |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-8` | Switch to shape (1=Heart, 2=Flower, ...) |
| `Space` | Randomise colour theme |
| `R` | Reset camera position |

---

## 🚀 Getting Started

### Prerequisites
- A modern browser — **Chrome or Edge recommended** (best WebGL + webcam support)
- A webcam (optional — hand tracking is a bonus feature; the app works without it)
- Node.js installed (for the `npx serve` method below)

---

### ▶️ Method 1 — VS Code Live Server (Easiest, no install needed)

1. Open the project folder in **VS Code**
2. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
3. Right-click `index.html` in the Explorer panel
4. Click **"Open with Live Server"**
5. Your browser will open automatically at `http://127.0.0.1:5500`

---

### ▶️ Method 2 — npx serve (Quick terminal method)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/particlemancer.git
cd particlemancer

# Serve it instantly — no install required
npx serve . -l 3000
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### ▶️ Method 3 — Python (if you have Python installed)

```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### ⚠️ Important
- **Do NOT open `index.html` directly** as a `file://` URL — browsers block camera access on `file://` origins. Always use a local server (`http://localhost`).
- When prompted, click **"Allow"** to grant camera access for hand tracking.
- If you deny camera access, the app still works fully — use the **buttons and sliders** instead.

---

## 📁 Project Structure

```
particlemancer/
├── index.html              # Entry point
├── css/
│   └── styles.css          # All styles with glassmorphism UI
├── js/
│   ├── particleTemplates.js  # 8 shape generators (heart, flower, saturn, etc.)
│   ├── handTracking.js       # MediaPipe Hands integration & gesture recognition
│   └── app.js                # Main Three.js app, animation loop, UI logic
└── README.md
```

---

## 🛠 Tech Stack

- **[Three.js](https://threejs.org/)** — 3D rendering & particle system
- **[MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)** — Real-time hand landmark detection
- **Vanilla JavaScript** — No build tools, no framework overhead
- **CSS3** — Glassmorphism, backdrop-filter, custom range inputs

---

## 📸 Screenshots

> *Run the project and take screenshots to add here!*

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

**Made with ❤️ and 🖐 hand waves**
