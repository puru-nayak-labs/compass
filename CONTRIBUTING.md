# Contributing to Compass

Thanks for your interest! Below is everything you need to make a contribution.

---

## Quick Start

```bash
git clone https://github.com/puru-nayak-labs/compass.git
cd compass
npm install
# add your data files to data/ (see README.md step 2)
node server.js
```

---

## Branch & PR Workflow

```bash
git checkout -b feature/your-feature-name
# make changes
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# open a Pull Request on GitHub
```

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `chore:` — build, deps, config

---

## What Can I Contribute?

| Type | How |
|---|---|
| **New KPI endpoint** | Add a route in `server.js` + wire in `public/index.html` + add chat intent |
| **New chart / UI feature** | Edit `public/index.html` (self-contained Vanilla JS SPA) |
| **New chat intent** | Add an `if` branch in the `/api/chat` handler (~line 1246 in `server.js`) |
| **Bug fix** | Fix + add a note in PR description about what data state triggers it |
| **New data source connector** | See [`docs/contributing.html`](docs/contributing.html) — `DataConnector` interface |
| **New insight rule** | See [`docs/contributing.html`](docs/contributing.html) — `InsightRule` pure function |
| **Platform architecture change** | Open an issue first to discuss before coding |

---

## PR Checklist

- [ ] Tested locally with `node server.js` and verified in browser
- [ ] No proprietary or sensitive data committed (check `.gitignore`)
- [ ] Commit message follows Conventional Commits format
- [ ] `README.md` updated if a new feature or endpoint was added
- [ ] No new `console.log` left in production paths

---

## File Map

```
server.js          — Express API + KPI engine + chat agent (all backend logic)
public/index.html  — Full SPA frontend (Vanilla JS + Chart.js)
public/hierarchy.json — Geo → Market → Country filter tree (regenerate with build_hierarchy.mjs)
docs/              — Platform design & architecture HTML docs
Dockerfile         — Container build
deploy.ps1         — One-command Docker build + push script
```

---

## Questions?

Open an issue: https://github.com/puru-nayak-labs/compass/issues
