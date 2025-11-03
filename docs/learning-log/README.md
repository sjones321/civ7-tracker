# Learning Log

## Purpose

The **Learning Log** is the reflective companion to the devlog. While the devlog captures *what* was done each day (commits, features, fixes), the Learning Log captures *how* and *why* — the insights, patterns, lessons, and technical decisions worth remembering.

## What Goes Here

- **Technical Discoveries:** "Found that database check constraints reject empty strings, need explicit null"
- **Design Decisions:** "Chose to consolidate three civ fields into one to reduce form complexity"
- **Patterns & Best Practices:** "Autocomplete dropdown positioning must be relative to parent container"
- **Problem-Solving Approaches:** "Debugging async save issues by adding console logs at each transformation step"
- **Tooling Insights:** "Stream Deck integration significantly improved dev workflow startup time"
- **Architectural Lessons:** "Separating data transformation logic (convertToDb/convertFromDb) made debugging much easier"

## What Doesn't Go Here

- Daily task lists (that's the devlog)
- Code snippets without context (use devlog notes section)
- Bug reports (use GitHub issues)
- Generic todos (use todo_write or devlog next steps)

## Format

Each entry should be dated and focused on a specific lesson or insight. Entries can be short (a paragraph) or long (detailed explanation with examples). The key is capturing knowledge that will be useful weeks or months later when similar situations arise.

## Relationship to Devlog

- **Devlog:** "Fixed autocomplete dropdown positioning issue"
- **Learning Log:** "Learned that absolutely positioned dropdowns inside scrollable containers need to calculate position relative to the container, not the document. Used `getBoundingClientRect()` on both input and container, then subtracted container offset. This pattern will be useful for any future overlay components."

Think of the Learning Log as "developer brain notes" for the long haul — the accumulated wisdom that makes you faster and smarter on future problems.

