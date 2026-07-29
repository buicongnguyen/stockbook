# Stockbook

A bilingual English/Vietnamese learning site built from *Investment Experience*.

## Features

- Persistent EN/VI language switch
- Five full book chapters in both languages
- Stock-buying decision framework
- Strategy comparison library
- Position-size and reward-to-risk calculators
- Stockbook Journey, a bilingual 12-stage decision-training game
- Process-based scoring, campaign progression, and device-local save/resume
- English and Vietnamese PDF downloads
- Automated GitHub Pages deployment

## Development

```bash
npm install
npm run dev
```

## Validation and static export

```bash
npm run pages
```

The static site is written to `gh-pages/`. Pushes to `main` deploy through the
workflow in `.github/workflows/deploy-pages.yml`.

## Disclaimer

The material is for educational purposes only and is not investment advice.
