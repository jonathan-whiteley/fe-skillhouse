# new-this-week

A customer-facing one-slider of the most meaningful recent Databricks product releases, curated for one
customer: three pillars (Genie & BI; Data Eng & Platform/Governance; Data Science & AI), 7-11 items, one headline
card, and a "For <Customer>" line on every item. Optional feature-spotlight page.

```
/plugin install new-this-week --marketplace jonathan-whiteley/fe-skillhouse
/plugin install dbx-open-slide --marketplace jonathan-whiteley/fe-skillhouse
```

Say "new this week for Northwind Retail, last 14 days". The skill:

1. Asks for the customer, window, cloud, and what they're working on (your words, pasted notes, or their open use
   cases from Salesforce if you have `fe-salesforce-tools`).
2. Pulls the window's releases from the official AWS/Azure/GCP release-note feeds plus the Databricks blog, curates,
   and **stops to show you the shortlist** before anything is built.
3. Generates the slide into your open-slide project, builds and screenshots it, and auto-fits the type.
4. Runs a leak check on terms you name (codenames, use-case codes, excluded products), then exports one 1920×1080
   PDF with live links to `~/Downloads` (Google Slides on request).

## Requirements

- The **dbx-open-slide** plugin (project setup, build, screenshots, Google Slides export) and everything it needs:
  Node 20+, Python 3, vibe's `fe-google-tools` signed in with your databricks.com account.
- Google Chrome in `/Applications` and Node 22+ (the PDF export runs open-slide's export in headless Chrome).
- Optional: `fe-salesforce-tools` (use-case context), `fe-internal-tools` (Glean sanity check).

Everything on the slide links to public docs, release notes or blog posts; the content check refuses internal
links and em/en dashes before the deck is written.
