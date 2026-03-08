This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Workshop Material Inventory

Material availability in the configurator is driven by:

- `data/workshop-materials.json`

Each entry in `sheets` is one stock item:

```json
{
  "id": "mdf-5-60x40-a",
  "material": "mdf",
  "thicknessMm": 5,
  "widthCm": 60,
  "heightCm": 40,
  "quantity": 2,
  "note": "optional text"
}
```

Allowed `material` values:

- `mdf`
- `multiplex`
- `acryl`

How availability works:

- A material/thickness is selectable only if at least one sheet with `quantity > 0` can fit the configured sign area (`widthCm * heightCm`).
- If a currently selected option becomes unavailable, the UI auto-switches to the first available option.

## Pricing Configuration

Price estimation in `Kostenvoranschlag` is driven by:

- `data/pricing-config.json`

Main sections:

- `materialRates`: price per square meter by material + thickness
- `laserCutting`: setup fee, per-cm2 fee, per-letter fee, minimum fee
- `delivery.methods`: selectable delivery methods with flat fees
- `delivery.freeFromSubtotal`: free shipping threshold (except pickup)
- `vatPercent`: VAT rate applied to net total

Example material rate entry:

```json
{ "material": "mdf", "thicknessMm": 5, "pricePerM2": 52 }
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
