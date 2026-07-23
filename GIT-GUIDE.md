A step-by-step guide to get this project on your computer, run it, make changes, and publish them safely.

> **This project uses `pnpm`** (not `npm`) and **Node 22**. Details below.

---

## Table of contents

1. [One-time setup](#1-one-time-setup)
2. [Clone the project](#2-clone-the-project)
3. [Open terminal in VS Code / Cursor](#3-open-terminal-in-vs-code--cursor)
4. [Install & run the project](#4-install--run-the-project)
5. [Branches: main vs develop](#5-branches-main-vs-develop)
6. [Daily routine (make changes)](#6-daily-routine-make-changes)
7. [Go live (develop → main)](#7-go-live-develop--main)
8. [Cheat sheet](#8-cheat-sheet)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. One-time setup

Do these once, ever.

**Install Git**

- Mac: open Terminal, type `git --version`. If missing, it offers to install.
- Windows: download from https://git-scm.com and click Next through the installer.

**Tell Git who you are**

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

**Install Node 22** (needed to run the project)

- Download from https://nodejs.org — pick version 22.
- Check it worked:

```bash
node --version    # should say v22.x
```

**Install pnpm** (the package manager this project uses)

```bash
npm install -g pnpm
```

`-g` = install globally, so it works everywhere on your computer.

---

## 2. Clone the project

Clone = copy the project from GitHub to your computer.

```bash
cd Desktop                                              # move into your Desktop folder
git clone https://github.com/USERNAME/REPO-NAME.git     # copy the repo down
cd REPO-NAME                                             # move into the project folder
```

- `cd` = "change directory" (move into a folder).
- Get the real URL from GitHub: green **Code** button → copy the HTTPS link.

---

## 3. Open terminal in VS Code / Cursor

- **Menu:** View → Terminal
- **Shortcut:** `` Ctrl + ` `` (backtick key, top-left under Esc). Same on Mac and Windows.

The terminal opens at the bottom, already inside your project folder (no `cd` needed if you opened the project folder in the editor).

Check where you are:

```bash
pwd     # "print working directory" — shows the current folder
```

It should end in the project name.

---

## 4. Install & run the project

**First time only: install dependencies**

Dependencies are libraries (code other people wrote) the project needs. They are NOT included when you clone — you install them.

```bash
pnpm install
```

- Downloads everything listed in `package.json`.
- Creates a `node_modules` folder (large, ignored by Git — don't touch it).
- Run this once after cloning, and again only if someone adds a new library.

**Run the project locally**

```bash
pnpm start
```

(same as `pnpm dev`)

- The terminal prints a link like `http://localhost:4321`.
- **Cmd/Ctrl + click** the link to open the site in your browser.
- Save a file → the browser updates automatically. No restart needed.

**Stop the server:** click in the terminal, press `Ctrl + C`.

> npm equivalents (for reference): `npm install`, `npm run start`. This repo wants pnpm.

---

## 5. Branches: main vs develop

A branch is a separate copy of the code where you work without touching the live site.

| Branch    | What it is                                                | Who sees it       |
| --------- | --------------------------------------------------------- | ----------------- |
| `main`    | **Production** — the real live website                    | Everyone (public) |
| `develop` | **Staging** — test area to check work before it goes live | Team only         |

**The flow:**

```
develop (staging)  →  test it  →  main (production, live)
```

**Golden rule:** never change `main` directly. Always work on `develop`, test on staging, then merge to `main` to go live.

Check which branch you're on:

```bash
git branch     # the one with a * is where you are
```

---

## 6. Daily routine (make changes)

Do this every time you want to change something.

```bash
git checkout develop   # 1. switch to the staging branch
git pull               # 2. get the latest version
pnpm install           # 3. ONLY if someone added a new library
pnpm start             # 4. run the site locally to see your work
# ...edit files, save, watch the browser update...
git status             # 5. see what you changed
git add .              # 6. stage all your changes
git commit -m "Describe what you changed"   # 7. save a snapshot with a message
git push               # 8. send changes to GitHub (staging)
```

- `git checkout <branch>` = switch which branch you're on.
- `git pull` = download the latest so you don't overwrite others' work.
- `git add .` = mark all changed files as ready to save (`.` means "everything").
- `git commit -m "..."` = save a snapshot with a short description.
- `git push` = upload your saved snapshots to GitHub.

Keep commit messages short and clear, e.g. `"Update homepage title"`.

After pushing, your changes appear on the **staging** site. Check them there.

---

## 7. Go live (develop → main)

Once staging looks good, move the changes to production.

**Safe way (recommended): Pull Request on GitHub**

1. Go to the repo on GitHub.com.
2. Click **Pull requests** → **New pull request**.
3. Set **base = `main`**, **compare = `develop`**.
4. Click **Create pull request** → **Merge**.
5. `main` updates → the **live site** updates.

A Pull Request is a safety checkpoint — it can be reviewed before going live. No scary commands.

**Command way (only if needed):**

```bash
git checkout main
git pull
git merge develop
git push
git checkout develop   # switch back so you keep working on develop
```

---

## 8. Cheat sheet

**First time after cloning:**

```bash
pnpm install
pnpm start
```

**Every working session:**

```bash
git checkout develop
git pull
pnpm start
# ...edit, save...
git add .
git commit -m "what I did"
git push
```

**Golden rules:**

- Always `git pull` before you start, always `git push` when you finish.
- Work on `develop`. Never commit directly to `main`.
- Go live via a GitHub Pull Request (develop → main).

---

## 9. Troubleshooting

| Problem                                   | Fix                                                             |
| ----------------------------------------- | --------------------------------------------------------------- |
| `command not found: pnpm`                 | `npm install -g pnpm`                                           |
| `command not found: node`                 | Install Node 22 from https://nodejs.org                         |
| "Please commit your changes" when pulling | Do `git add .` + `git commit -m "..."` first, then `git pull`   |
| Push rejected                             | Run `git pull` first, then `git push`                           |
| Errors after `git pull`                   | Run `pnpm install` (someone added a library)                    |
| Port already in use                       | Press `Ctrl+C` in the old terminal, or let it pick a new port   |
| Weird / broken state                      | Delete the `node_modules` folder, then run `pnpm install` again |
| Undo unsaved edits to a file              | `git checkout -- FILENAME`                                      |
| Lost, don't know where you are            | `git status` and `pwd`                                          |
