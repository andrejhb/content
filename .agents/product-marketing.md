# Product Marketing Context (pointer)

This repo is multi-product. The marketing context that used to live in this
file now lives per product:

- `products/host/product-marketing.md` — Hububb Host (the original content of this file)
- `products/<slug>/product-marketing.md` — every other product, one folder each

Each product folder also holds `persona.json` (audience, JTBD, pains,
lifestyle, archetypes) and `qa.json` (competitors, unbuilt features, allowed
proof claims) for that product.

If you were sent here by a skill: read the product folder for the product the
user is working on. If the user hasn't named one and more than one product
exists, ask which. New products are onboarded with the `product-onboard` skill.
