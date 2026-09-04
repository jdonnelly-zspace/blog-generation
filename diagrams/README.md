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

### Lucidchart

**There is no `.mmd` file import.** Lucid takes Mermaid by paste, not by file:

1. Open a Lucidchart document.
2. Click the **Diagram as code** icon in the far-left Primary Toolbar.
3. **+ New Mermaid diagram**.
4. Paste the contents of one `.mmd` file and click **Generate**. The diagram
   appears on the canvas and re-renders as you edit the code.

What you get is a **code-linked object**, not loose shapes. It stays bound to
the Mermaid source, so editing the code updates the diagram — but you cannot
move or restyle individual shapes.

To get native, shape-by-shape editable Lucid shapes, use **Disconnect from
code** in the object's drop-down. That is the step that turns it into ordinary
Lucid shapes you can restyle, rearrange, and attach hotspots to.

The trade-off: disconnecting is one-way. Once disconnected, the diagram no
longer tracks the `.mmd`, so later changes mean re-pasting and restyling.
Keep it connected while the content is still moving; disconnect when you are
ready to style for an audience.

If Mermaid paste is unavailable or a diagram will not generate, the fallback is
to render the `.mmd` to SVG or PNG and place that as an image — accurate, but
flat and not editable.

**Version note:** Lucid targets Mermaid **11.14**. These files were validated
against **10.9.1** and use only long-stable syntax (`flowchart`,
`sequenceDiagram`, `erDiagram`, subgraphs, `<br/>` labels), so they should be
fine — but that specific pairing is untested.

Two things worth doing once disconnected:

- Rebuild `02` as a **cross-functional flowchart**. Its three subgraphs are
  already laid out left-to-right, which is the shape Lucid's swimlane
  container expects — the lanes become rows and the phases run along them.
- Add **hotspots** on shapes that map to real files, linking to their GitHub
  paths, so a reader can click `SKILL.md` and land on the actual file.

Both need real shapes, so they come after **Disconnect from code**.

### Canvas sizes

Roughly what each one needs, from the Mermaid render. Lucid re-runs its own
layout on import, so treat these as proportions rather than exact figures.

| File | Approx. | Shape |
|---|---|---|
| `01` | 1785 x 1066 | landscape |
| `02` | 3721 x 575 | wide band — it is a swimlane |
| `03` | 1726 x 1217 | portrait-ish, grows with participants |
| `04` | 1004 x 752 | compact |
| `05` | 1398 x 1372 | square |
| `06` | 739 x 1071 | portrait |

### If labels look wrong

Multi-line labels use `<br/>`, which is standard Mermaid. If Lucid renders it
literally instead of breaking the line, replace each `<br/>` with ` - `. The
diagrams get wider but stay correct.

`01`, `02` and `06` were originally laid out left-to-right and came out
unusable — `06` rendered as a 4367 x 252 ribbon. Orientation and shorter
labels fixed it. Subgraph `direction` overrides were tested and made no
difference, so none are used.

Lucid never pushes edits back into these files. When the workflow changes,
edit the `.mmd` and re-paste.

## Keeping them true

These describe the system as of the commit they land in. If you change the
workflow — a new phase, a different Directus call, a change to how writers are
provisioned — update the matching file in the same commit.
