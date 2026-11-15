---
name: travel-product-title-planner
description: Read Spring Tour ERP itinerary and description pages for one or more product IDs, then create evidence-backed Chinese tourism product titles. Use when the user supplies Spring Tour product IDs or detail URLs and asks for product titles; this skill is read-only and does not fill, save, confirm, or publish ERP content.
---

# Travel Product Title Planner

Create one normal-length, information-rich Chinese title per product. Every substantive selling point must be supported by the product's own itinerary or description page.

## Inputs

Accept one or more numeric product IDs, direct detail URLs, and optional user-provided reference titles. Reference titles control tone and organization only; never inherit an unsupported claim from them.

When the user supplies only an ID, build these exact URLs:

```text
https://houtai.springtour.com/erp/Product/tourVacation/ProductDetail?productId={ID}&tab=travelPage
https://houtai.springtour.com/erp/Product/tourVacation/ProductDetail?productId={ID}&tab=Description
```

Strip Markdown escaping such as `\&` before navigation.

## Read-only browser workflow

1. Use the user's already logged-in external browser and locate a `houtai.springtour.com` product tab. Navigate directly to the two URLs for each ID.
2. Read `Description` first to collect candidate selling points, then read `travelPage` and the fee/booking sections to verify them. For a batch, finish and record one product before moving to the next.
3. Never click or invoke Save, Product Confirmation, Product Self-check, Publish, or any other mutation unless the user makes a separate explicit request.
4. Do not automate credentials, password managers, or CAPTCHA. If login is required, the page is incomplete, or browser control stops, ask the user to open the requested page and keep it active.
5. Do not infer one product's contents from adjacent IDs, similar names, or earlier products.

Do not draft a final title until both pages have been read, unless the user explicitly permits a one-page result.

## Evidence checklist

From the description, collect candidate selling points from `亮点推荐` and `产品特色` first. Also inspect `费用包含`, `费用不含`, booking restrictions, and supply notes for inclusions or qualifiers.

From the itinerary, verify:

- product name, destinations, day count, accommodation nights, departure and return cities;
- airlines and flight wording;
- each day's included attractions and experiences;
- complete free days versus partial free time;
- accommodation wording, meals, shopping stops, duty-free stores, and optional activities.

Maintain an evidence ledger for every claim considered for the title: claim, exact page section, inclusion status, qualifier, and any contradiction.

## Decision rules

Use `亮点推荐` and `产品特色` as discovery sources, not as final proof. Keep a candidate only after checking it against the itinerary, accommodation/meal fields, Fees Included, Fees Excluded, and relevant restrictions.

Use this authority order when pages disagree:

1. Specific daily itinerary and accommodation/meal fields.
2. Fees Included and Fees Excluded; an exclusion overrides marketing copy.
3. Booking restrictions and supply notes that qualify availability.
4. Product Features and Highlight Recommendations.
5. Existing product title, used only as a hint.

Apply these rules conservatively:

- Preserve `参考`, `或同级`, and similar hotel qualifiers. Do not promise a named hotel unless the product does.
- Do not convert local hotel classes, stars, flowers, or platform diamond ratings into one another. Prefer the contractual wording in Fees Included when it conflicts with marketing copy.
- Treat optional, recommended, self-paid, weather-dependent, and locally refundable activities as not included.
- Do not say `纯玩`, `零购物`, or equivalent when any day includes a shopping store or duty-free visit. Disclose material shopping arrangements in the notes.
- Count `全天自由活动` only when the full day has no group itinerary. Describe free time on a departure day as `返程日前自由安排`, not another full free day.
- Use `直飞`, `往返机票含税`, `全国联运`, group-size promises, insurance amounts, gifts, Wi-Fi, and similar claims only when explicitly supported.
- Derive nights from actual accommodation nights. If flights are shown but inclusion is unclear, write `上海出发` rather than promising included round-trip flights.
- Use meal counts only when they reconcile with Fees Included or the daily meal fields.
- If a contradiction cannot be resolved, a condition cannot be stated accurately in the title, or a claim cannot be verified, omit that selling point and state the issue after the title.

## Title construction

Return one normal-length main title per product; do not create a shortened alternative unless requested. Prefer this structure, adapting it to the evidence:

```text
产品系列/定位•目的地+天数晚数+产品类型•出发或交通方式｜
住宿卖点｜行程节奏/自由活动｜核心景点｜特色体验/餐食｜明确包含项目
```

Use `•` for the opening identity and `｜` between selling-point groups. Prioritize distinctive, included experiences over generic praise. Avoid absolute superlatives and vague claims such as `顶级`, `必去`, `无忧`, or `全覆盖` unless the product itself makes a verifiable, relevant commitment.

Before drafting, read [references/title-examples.md](references/title-examples.md). Use those examples to learn information density, grouping, rhythm, and separator style; never copy their destinations, hotels, inclusions, ratings, or promotional claims into another product.

## Output

For each product, provide:

1. `产品ID｜主推标题`
2. A detailed evidence table with one separate row for every substantive selling point in the title. Include the exact title fragment, source page, precise section or itinerary day, verification result, and any required qualifier. Do not merge several selling points into one generic source row.
3. A short risk note covering omitted self-pay items, shopping, hotel qualifiers, incomplete inclusions, and page contradictions.

State that the browser was used read-only and that no ERP content was saved or modified.
