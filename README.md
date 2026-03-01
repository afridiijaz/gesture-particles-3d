# ✨ ParticleMancer

> A real-time interactive 3D particle system powered by **Three.js** and **MediaPipe Hands** — control beautiful particle formations with your bare hands!

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

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/particlemancer.git
cd particlemancer
```

### 2. Serve locally

Since this project uses webcam access (requires HTTPS or localhost), use any local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using VS Code
# Install "Live Server" extension → Right-click index.html → "Open with Live Server"
```

### 3. Open in browser

Navigate to `http://localhost:8000` and **allow camera access** when prompted.

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
