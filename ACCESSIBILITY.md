What else could be done

These are the next-tier improvements beyond the fixes already made:

Content/structural
•  Add a <h2> or aria-label to the Issues section (currently has no heading, just icon cards)
•  Add aria-current="page" to nav links for the active page (beyond just the .active class)
•  The "skip to content" link jumps to #primary, but the navbar is hidden until scroll -- consider making the navbar always visible or adding a second skip link for when the nav appears

Color contrast
•  Run a contrast audit with a tool like axe DevTools or the Lighthouse accessibility panel in Chrome DevTools. The text-muted class (#6c757d) on light backgrounds is borderline at AA for smaller text sizes, and the yellow (#ffc107) banner CTA pill with dark text may need checking.

Forms
•  Add autocomplete attributes to form fields (autocomplete="name", autocomplete="email", autocomplete="postal-code", autocomplete="tel") -- this helps autofill and assistive tech
•  Add visible error states with aria-describedby linking inputs to their error messages, rather than only the generic alert
•  The reCAPTCHA div (line ~138 of index.html) is present but unused since you switched to Turnstile -- removing it would reduce screen reader clutter

Media
•  Add a text fallback or transcript link for the YouTube video for deaf/hard-of-hearing users
•  Policy page images authored in markdown content should be checked for alt text
