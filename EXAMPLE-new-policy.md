# Example: Adding a New Policy Page

This is an example of how to create a new policy page. Follow the steps in the README to add this to your site.

## Step 1: Create the content file at `content/policy/healthcare-reform.md`

```markdown
---
title: "Healthcare Reform for All Americans"
subtitle: "A comprehensive approach to universal healthcare"
description: "Jose Vega's comprehensive healthcare reform proposal for universal coverage and affordable care"
date: 2024-12-01
type: "policy"
---

Healthcare is a fundamental human right, not a privilege reserved for the wealthy. Every American deserves access to quality, affordable healthcare regardless of their economic status, employment situation, or pre-existing conditions.

## The Current Healthcare Crisis

The United States spends more on healthcare per capita than any other developed nation, yet millions of Americans remain uninsured or underinsured. This is not just a moral failing—it's an economic disaster that costs lives and drains resources from productive economic development.

<blockquote class="blockquote text-center mb-5">
    <p>"Healthcare is a human right, not a commodity to be bought and sold."</p>
    <footer class="blockquote-footer">Jose Vega</footer>
</blockquote>

## A LaRouche Approach to Healthcare

Following the principles outlined in LaRouche's Four Laws, we must approach healthcare reform from the standpoint of increasing the productive powers of labor and advancing human scientific capabilities.

**Our healthcare reform proposal includes:**

1. **Universal Single-Payer System**: Eliminate the parasitic insurance industry and create a national healthcare system
2. **Massive Hospital Construction**: Build new modern hospitals in underserved areas, especially in the Bronx
3. **Medical Research Investment**: Dramatically increase funding for medical research and development
4. **Healthcare Workforce Development**: Train a new generation of healthcare professionals through expanded education programs

## Implementation Strategy

This reform cannot be implemented piecemeal. It requires the same commitment to the General Welfare that guided Franklin Roosevelt's New Deal programs. We must view healthcare as essential infrastructure, like roads and power plants, that enables the entire society to function and develop.

<div class="text-center my-4">
    <p class="font-weight-bold">Healthcare for all, paid for by all, administered by all—for the benefit of the entire human species.</p>
</div>
```

## Step 2: Add to navigation in `hugo.toml`

Add this to the `[[params.policyProposals]]` section:

```toml
[[params.policyProposals]]
  title = "Healthcare Reform for All Americans"
  url = "/policy/healthcare-reform/"
```

## Step 3: Build and test

```bash
npm run build
npm run dev
```

Your new policy page will be available at http://localhost:8080/policy/healthcare-reform/

---

**Note**: This is just an example file to show the process. Delete this file (`EXAMPLE-new-policy.md`) after reviewing the instructions.
