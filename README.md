# MotionShelf

A library of copyable first-party UI examples and offline developer tools, with a
reviewed submission flow. Preview an example, copy its source, take the setup
command or download the files. Nothing is published automatically.

Live at [motionshelf.onrender.com](https://motionshelf.onrender.com/).

## Why it exists

Component galleries are mostly screenshots with a blog post attached. What you
actually need is the code, the setup, and the confidence that opening it will not
do anything to you. MotionShelf keeps the library first-party and copies out real
source, and it treats submitted code as data: inspected, never executed.

## What you can do

- **Browse the library** and preview a working example.
- **Copy the source**, the setup command, or download the files.
- **Open the interactions collection**, which carries six examples with vanilla
  JavaScript, React, Vue and Svelte exports.
- **Use the offline tools**, which run in the browser without a request.
- **Submit something**: a public page, a GitHub source URL, or bounded source
  files for review.

## How submissions are handled

A submitted page or file set goes through inspection and moderation before
anything appears. `source-inspector.js` reads uploaded code as data, `validation.js`
checks it against the rules, and `moderation.js` holds the review state. The
pipeline never runs submitted code, and publishing is a decision rather than a
side effect of upload.

## Running it

Node 20 or newer.

```bash
npm install
npm start               # node :3000
npm test                # node --test tests/*.test.js
npm run validate        # library data validation
npm run dev:frontend    # frontend dev build
npm run build:frontend  # production frontend build
```

There are also audit suites for each surface: `npm run audit:review`,
`audit:followup`, `audit:admin-ui`, `audit:gallery`, `audit:interactions`, plus
`build:interaction-exports` for the framework exports.

`render.yaml` describes the deployment. `agents/` holds the agent-facing
instructions, `data/` the library records, `public/` the served front end.

## What is not here

- No submissions are auto-published, and there is no open upload endpoint.
- No third-party component marketplace. The library is first-party examples plus
  selected links to upstream projects.
- `adversarial-retest-2026-10-15.md` records what was tried against the review
  flow; read it before changing moderation.
- Instructions for agents that browse the site live in `agents/`, not here.

## How it is built

```
server.js               the Node server
public/                 the served front end
data/                   library records
scripts/                build, validation and audit suites
tests/                  node --test suites
agents/                 agent-facing instructions
contribution.js, moderation.js, validation.js, source-inspector.js
roadmap.js, github-stars.js
```

## Licence

First-party MotionShelf code is MIT licensed, see `LICENSE`. Linked upstream
projects and bundled third-party assets keep their own licences.
