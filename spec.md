Main Title: Renton Children's Business Fair
** Main Page **
Banner will have a logo and the main title on the left. 
It will also have menu like Our Story, Mission, Vision, Youth Vendors, Fairs
Clicking on Our Story or Mission or Vision, it'll take us to 'About Us' page with Our Story, Mission, Vision
Clicking on Fairs will take us to 'Fairs' page with sessions showcasing previous fairs (one paragraph on date/time, location and pictures in carousel)
Clicking on Youth Vendors will take use to 'Vendors' page with similar layout as 'Fairs' page but with Vendors.  It'll be videos instead pictures.

On the main page, we will have 'Upcoming Fair' info, "Our story", "Testomonials", and some pictures from past fairs.  

** Color template **
This is the css texts for it.  Put it in a different file so that we can change all layout in one place. 
:root {
  /* Primary Colors */
  --color-trust-blue: #1E90FF;       /* Headers, primary CTAs, links */
  --color-growth-green: #00C853;     /* Secondary buttons, highlights, badges */
  --color-energy-orange: #FFA500;    /* Accent lines, callouts, buttons */

  /* Secondary / Accent Colors */
  --color-sunshine-yellow: #FFD700;  /* Icons, emphasis text, small highlights */
  --color-deep-navy: #0D1B2A;        /* Main text, footer background, important headers */
  --color-cool-gray: #F5F5F5;        /* Section backgrounds, cards, spacing */

  /* Neutral / Background Colors */
  --color-white: #FFFFFF;            /* Main background */
  --color-light-gray: #E0E0E0;       /* Borders, subtle shadows, separators */
}

/* Example Usage */

/* Body */
body {
  background-color: var(--color-white);
  color: var(--color-deep-navy);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  color: var(--color-trust-blue);
}

/* Primary Buttons */
.button-primary {
  background-color: var(--color-energy-orange);
  color: var(--color-white);
  border-radius: 6px;
  padding: 0.6em 1.2em;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

/* Secondary Buttons */
.button-secondary {
  background-color: var(--color-growth-green);
  color: var(--color-white);
  border-radius: 6px;
  padding: 0.6em 1.2em;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

/* Card / Section Background */
.section-card {
  background-color: var(--color-cool-gray);
  padding: 2em;
  border-radius: 8px;
}

/* Footer */
footer {
  background-color: var(--color-deep-navy);
  color: var(--color-white);
  padding: 2em;
}

/* Highlights / Icons */
.highlight {
  color: var(--color-sunshine-yellow);
}

 
