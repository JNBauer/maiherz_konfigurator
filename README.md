# Maiherz Name Configurator

A web-based configurator for designing a personalized wooden "Maiherz" sign: a heart shape with a custom name on top. It supports multiple heart variants, typography, sizes, materials, and engraving options, all shown in a realistic 3D workbench scene.

The focus is on the design experience. Users configure their piece and send an order request with their chosen settings and a production-ready SVG that can be used for laser cutting. The goal is to connect a playful, visual customization tool with a practical workshop workflow.

This project is inspired by the "Maiherzen" custom around the Rhineland, where decorated hearts are given on the first of May.

Core ideas:
- Intuitive, visual customization of a heart + name layout
- Real-world sizing tied to a physical scale in the scene
- Design checks for laser feasibility (safety margins, thin spots)
- Multiple heart shape variants and material options
- A clean handoff to manual production via email + SVG

## What It Does

- Live 3D preview of the heart + text composition
- Size controls mapped to real-world centimeters
- Safety checks that flag text too close to the heart edge
- Laser readiness checks for thin stroke distances
- Export-ready SVG sent with the customer request

## Acknowledgements

Fonts:
- Borel
- Cherry Bomb One
- Dancing Script
- Geist
- Geist Mono
- Josefin Sans
- Lobster

Textures and images:
- Birch log header image in `public/birkenstamm.png`
- Workshop HDRs in `public/hdri/`

3D models:
- Workbench scene model in `public/models/`
