# Shopping Copilot Evaluation Portfolio

An interactive, bilingual portfolio presenting the evaluation framework, benchmark results, diagnostics, robustness tests, generalization evidence, and engineering profile of Shopping Copilot.

## Live demo

The public site is deployed with GitHub Pages from this independent personal repository.

## Local development

```text
npm ci
npm run check
npm run dev
```

## Production build

```text
npm run build
```

The build is written to `dist/`. GitHub Actions deploys this directory to GitHub Pages.

## Public data boundary

The bundled `src/data/dashboardData.json` contains only reviewed evaluation metrics, 200 compact Session result records and version provenance. It does not contain:

- API keys, tokens, cookies or environment variables;
- local absolute paths;
- Catalog rows or compressed Catalog files;
- raw per-turn conversation text;
- temporary evaluation snapshots;
- private evaluation data.

Official public-200, self-built generalization and self-built robustness results are visibly separated and are never combined into one score.

The dashboard reports frozen evaluation results; it does not include the Shopping Copilot agent source code.
