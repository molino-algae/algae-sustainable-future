# Algae: Fuels and Materials

Dedicated JUSTLAB class presentation: https://molino-algae.github.io/algae-sustainable-future/

21 visual slides, with a live commute activity on slide 2 and Algae Farm embedded on slide 20. The other slides preserve the original deck’s appearance as images.

## Presenting

- Use the arrow keys or the controls below the slides. The Slides button jumps to any slide.
- Use Tela cheia for full screen. Press S for presenter view, or Notas to read the current slide’s notes and sources.
- Slide 2 shows current class totals and a permanent student QR. Responses require internet, have no sign-in, and stay in the existing shared database.
- The game loads when you select Iniciar atividade on slide 20. Use the QR option for students’ phones or the separate-window link for a larger view. Use the navigation controls below the game to advance.
- For a static handout, open ?print-pdf and print to landscape PDF with backgrounds enabled. Live results remain online; the print version includes activity instructions and QR codes.

## Editing

The site is plain HTML/CSS/JavaScript. There is no build or installation step. The entry file is index.html; navigation is in presentation.js. Slide images and QR images are in assets/. slides.json is the structured content and notes index. When changing a note or activity, update both index.html and slides.json.

The live viewer is dashboard.html, dashboard.css and dashboard.js. It polls the public aggregate API every 3 seconds. The default class is 5DHYXTGV. For another class, update the frame query, student link, room code and QR together. Keep instructor management keys out of this public repository.

## Services and source credits

GitHub Pages serves the presentation. The commute API and database remain at the existing live service. Algae Farm loads from the JUSTLAB site, so changes to that game will appear here too. Local lecture slides use bundled images and reveal.js 6.0.2; live activities need internet.

See CREDITS.md for the full slide notes and sources. reveal.js is bundled under its MIT license in vendor/reveal-LICENSE. Source: https://github.com/hakimel/reveal.js .

GitHub Pages source: main branch, root folder, with .nojekyll.
