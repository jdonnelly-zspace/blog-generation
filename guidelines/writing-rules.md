# zSpace Blog — Writing Rules

Covers SEO requirements, HTML structure, and pre-publish validation. Paired with `voice-and-style.md` (tone, audience, canonical URLs).

## SEO Header (First Thing in Every Output)

```
Title: [45-60 char title with primary keyword] (XX characters)
URL Slug: [lowercase-slug-with-hyphens]
Excerpt: [130-160 char summary, plain ASCII only] (XXX characters)
Primary Keyword: [main search term]
Secondary Keywords: [3-5 related terms]
```

Always include character counts in parentheses.

## Character Limits (Strict)

- **Title:** 45-60 characters. Include primary keyword. Make it compelling.
- **Excerpt:** 130-160 characters. Doubles as meta description.
- **Excerpt must be plain ASCII** — no em dashes (—), curly quotes, or special Unicode. Directus has a regex validator on this field. Use `-`, `.`, and straight quotes only.

## URL Slug

- Lowercase, hyphens between words, no articles/filler (`a`, `an`, `the`).
- Include the primary keyword.
- Keep concise and readable.
- Example: "Top 3 AR/VR Solutions for Education" → `top-arvr-solutions-education`.

**Heads up:** Directus may auto-generate a slug from the title and overwrite the one you submit. After create, verify and PATCH back if needed — see `directus-schema.md`.

## Keyword Placement

Primary keyword must appear in: title, URL slug, excerpt, first paragraph, at least one `<h2>`. Use secondary keywords and semantic variations naturally — no stuffing.

## Structure

- **Word count:** 1,500-2,500 words.
- **Opening:** 2-3 paragraphs (~200 words) with primary keyword in paragraph 1.
- **Fold marker:** `<!--more-->` after the opening.
- **Body:** 3-7 `<h2>` sections (~1,200-2,000 words), `<h3>` for subsections. Bullet lists and short paragraphs (3-5 sentences) for scannability.
- **Conclusion:** 150-200 words, reinforce primary keyword, link to a zSpace resource.

## HTML Tags

| Element | Tag | Notes |
|---|---|---|
| Paragraphs | `<p>` | All body text. |
| Headers | `<h2>`, `<h3>` | **Never `<h1>`.** |
| Bold / Italic | `<strong>` / `<em>` | |
| Lists | `<ul>`, `<ol>`, `<li>` | |
| External links | `<a href="..." rel="noopener" target="_blank">` | Always both attrs. |
| Internal links | `<a href="...">` | No `target="_blank"`. |
| Fold marker | `<!--more-->` | After opening section. |
| Spacing | `&nbsp;` | Where needed. |

## Links

- **3-5 internal links** to zSpace pages per post.
- **2-4 external links** to authoritative sources (`.gov`, `.edu`, research journals, established news).
- **Use ONLY canonical zSpace URLs** — see the Canonical URLs table in `voice-and-style.md`. Never use deprecated forms like `/contact` or `/products`.
- Descriptive anchor text with keywords when natural.

## Pre-Publish Link Validation (Required)

Before flipping status from `draft` to `published`:

1. **Every zspace.com link:** open in a real browser, wait ~5s, confirm title is NOT "Page Not Found | zSpace." zspace.com is an Angular SPA — invalid routes return HTTP 200 then client-side redirect to `/404`. Automated HTTP checks miss these.
2. **Every blog.zspace.com link:** server-rendered, so HTTP status checks are reliable.
3. **Every external link:** confirm it loads. Cloudflare-protected sites may return 403 to automation but work in a browser — verify in a browser before calling it broken.
4. **Anchor text** still matches the destination after any URL swap.

## Output Format

Blog post output order:
1. SEO header block (plain text).
2. HTML content starting with `<p>` opening paragraph.
3. `<!--more-->` after opening.
4. Body `<h2>` / `<h3>` sections.
5. Conclusion.

## Example SEO Header

```
Title: AR/VR in STEM: Transform K-12 Science Education (52 characters)
URL Slug: arvr-stem-transform-k12-science-education
Excerpt: Discover how AR/VR technology transforms STEM education. zSpace brings hands-on science labs to K-12 classrooms without expensive equipment. (147 characters)
Primary Keyword: AR VR STEM education
Secondary Keywords: virtual reality science classroom, immersive STEM learning, K-12 AR technology, hands-on science education
```
