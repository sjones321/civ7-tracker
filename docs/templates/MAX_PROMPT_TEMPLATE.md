# MAX Prompt Template

Use this template when preparing a MAX automation prompt. Replace placeholders and
remove any sections that do not apply.

````md
```md
## Goal
- <clear objective>

## Constraints
- <time, scope, or tooling constraints>

## Deliverables
- <artifacts expected>

## Validation
```bash
npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"
npx --yes html-validate "**/*.html"
```

## Notes for Operator
- <context, risks, or dependencies>
```
````
