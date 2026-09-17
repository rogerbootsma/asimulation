# ASimulation.io

An independent Metaversal Arts research website about embodied agents and artificial life.

## Website

Static HTML, CSS, and JavaScript in `dist/`. Three.js is vendored with its MIT license. No build step, server-side service, external fonts, analytics, or application cookies.

- `index.html`: live four-agent habitat, research framing, social links.
- `app.js`: browser adaptation of selected Blender steering concepts; see `method.html` for limits.
- `designs.html`: three identity concepts and downloadable brand assets.
- `brand/`: editable SVGs, X and YouTube profile PNGs, 2560 × 1440 YouTube banner.

Serve `dist/` with any static HTTP server. Do not open the HTML through `file://`, because browser ES modules require HTTP.

## Deployment

GitHub Actions publishes only `dist/` to GitHub Pages using `.github/workflows/pages.yml`. Configure Pages source as GitHub Actions. Intended custom domain: `asimulation.io`. Domain setup status is recorded in `DEPLOYMENT.md`.

The unused local `.openai/hosting.json` records an earlier private draft registration. It is ignored, never published, and is not the hosting configuration for this project.

## Evidence boundary

The browser demonstration is rule-based steering and short-lived decaying spatial state. It does not train a neural network, use an LLM, implement the entire Blender system, or establish consciousness or AGI. Local prototype and research references were inspected on 2026-09-17. Research PDFs and Blender source are not included in this public repository.

## Local sources consulted

- Hyper Agents `asimulation/__init__.py`: `move_smooth`, capped personal-space bias, braking and turn limits.
- `asimulation/exploration.py`: decaying spatial familiarity and curiosity-inspired destination choice.
- `research/NPC-Concurrent-Behaviors.md` and `NPC-Geometric-Experience-and-Drives.md`: implementation boundaries and fixture evidence.
- ASimulation `Research/ASimulation_Blender_Embodied_Agent_Ecology.pdf`: proposed ecology architecture.
- `Research/Multidimensional_Curve_Projection_Memory_Research_Concept.pdf`: separate experimental memory proposal, not implemented here.

## Checks

The local CPU simulation harness runs actual application simulation code with only the rendering layer omitted. A 20-seed, 300-seconds-per-seed deterministic fixture checked finite positions, arena limits, body clearance, continued travel, bounded memory, and deterministic replay. Browser visual and interaction checks are recorded separately in local QA output. Fixture success does not establish general navigation correctness.

Brand export helper `create-brand.mjs` uses Sharp. Exported assets are committed; users do not need the export helper to run or deploy this site.


Run the reproducible simulation checks with: node tests/multi-seed.mjs. The checked-in result records this fixture only; temporary near-stationary spells reached about 17 seconds.
