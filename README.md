# Bhushan Phirke — Portfolio Website

A dark, terminal-themed portfolio built with HTML, CSS, vanilla JS, GSAP (animations),
and an Express.js backend that sends real emails from the contact form.

```
portfolio/
├── index.html          ← the whole frontend (HTML + CSS + JS in one file)
├── backend/
│   ├── server.js        ← Express API that emails contact form submissions
│   ├── package.json
│   └── .env.example      ← copy to .env and fill in your real values
└── README.md
```

## 1. Run the frontend

`index.html` is fully self-contained — just open it in a browser, or serve it with
any static host (Live Server extension, `npx serve`, GitHub Pages, Netlify, Vercel, etc).

It already links out to your real profiles:
- GitHub: https://github.com/bhushanphirke
- LinkedIn: https://www.linkedin.com/in/bhushan-phirke/
- LeetCode: https://leetcode.com/u/BHUSHAN157/
- Code360 (Coding Ninjas): https://www.naukri.com/code360/profile/BhushanP
- Codolio: https://codolio.com/profile/Bhushan157

The **LeetCode** and **GitHub** cards under "Coding Activity" fetch your live stats
in the browser using public APIs. If a fetch fails (network issue, API downtime), the
card gracefully falls back to just showing the profile link — nothing breaks.

## 2. Set up the backend (so the contact form actually sends you emails)

```bash
cd backend
npm install
cp .env.example .env
```

### Get a Gmail App Password (recommended, free, works in minutes)
1. Turn on 2-Step Verification on your Google account: https://myaccount.google.com/security
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password (choose "Mail" as the app). Google gives you a 16-character code.
4. Open `backend/.env` and fill in:
   ```
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=the16charactercode
   EMAIL_TO=your.email@gmail.com
   ```
   Do **not** use your normal Gmail password — it will not work and you shouldn't use it here anyway.

### Start the server
```bash
npm start
```
You should see: `Portfolio backend running on http://localhost:5000`

Test it's alive: open http://localhost:5000/api/health in a browser — you should see `{"success":true, ...}`.

## 3. Connect frontend to backend

By default the form calls `http://localhost:5000`. When you deploy the backend
(e.g. Render, Railway, Cyclic), add this line right before the closing `</body>`
tag in `index.html`, with your real deployed backend URL:

```html
<script>window.PORTFOLIO_API_BASE = "https://your-backend-url.onrender.com";</script>
```

Also update `ALLOWED_ORIGIN` in your backend `.env` to your deployed frontend URL,
so only your site can call the API.

## 4. Customizing content

Everything is plain, readable HTML inside `index.html`:
- Hero terminal boot lines: search for `bootLines` in the `<script>` tag.
- Skills: the `#skills` section, grouped into tag rows.
- Projects: the `#projects` section — each project is a `.project` block; add more
  by copying one block and giving it a new `id`.
- Colors/fonts: all defined as CSS variables at the top of the `<style>` tag under `:root`.

## Notes on the LeetCode stats API
The LeetCode stat card uses a free community API (`leetcode-stats-api.herokuapp.com`)
since LeetCode has no official public API. Free Heroku-style services occasionally sleep
or rate-limit — that's expected and handled by the fallback shown above. If you want more
reliability later, you can self-host a small proxy or swap in another LeetCode stats API.
