# Diagrams

Mermaid sources for the six architecture and workflow views of this project.
They are written as text so they live next to the code they describe and can be
regenerated in seconds when the workflow changes.

## The set

Two audiences, split deliberately — an engineer wants to know what calls what,
a writer wants to know what happens after they type `/blog`.

| File | Type | View | Answers |
|---|---|---|---|
| `01-system-architecture.mmd` | flowchart | Build | Where every piece lives and what talks to what |
| `02-writer-journey.mmd` | flowchart | Use | What happens when someone types `/blog` |
| `03-publish-sequence.mmd` | sequence | Build | The API calls in Phases 5–6, in order |
| `04-directus-data-model.mmd` | ER | Build | What tables a published post touches |
| `05-onboarding-provisioning.mmd` | flowchart | Build | How a new writer goes from nothing to first post |
| `06-governance-loop.mmd` | flowchart | Both | How a guideline change reaches the whole team |

## Rendering them

They render as-is in GitHub, or in anything that speaks Mermaid.

For Lucidchart: open a document, **Insert → Diagram as code**, enable the
**Mermaid** shape library, and paste one file. Lucid renders a live preview and
inserts real, editable Lucid shapes — not an image.

Two things worth doing after import:

- Rebuild `02` as a **cross-functional flowchart**. The three subgraphs are
  lanes; Lucid's swimlane container reads far better for a non-technical
  audience than Mermaid's subgraph boxes.
- Add **hotspots** on shapes that map to real files, linking to their GitHub
  paths, so a reader can click `SKILL.md` and land on the actual file.

Mermaid import is one-way. Lucid will not push edits back into these files, so
when the workflow changes, edit the `.mmd`, re-import, and restyle.

## Keeping them true

These describe the system as of the commit they land in. If you change the
workflow — a new phase, a different Directus call, a change to how writers are
provisioned — update the matching file in the same commit.
