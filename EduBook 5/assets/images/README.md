# images/

Reserved for static image assets (logo, icons, marketing/banner images).

Right now EduBook renders book covers as CSS gradients generated from the
`coverColors` field in `assets/js/books-data.js` — there are no real cover
photo files yet. When you add real book cover images or a site logo, drop
them in this folder (e.g. `assets/images/covers/`, `assets/images/logo.svg`)
and reference them from HTML/CSS with a path like:

- From `index.html` (root):     `assets/images/...`
- From any file in `pages/`:    `../assets/images/...`
