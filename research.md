# HeroBuilder3D Market Research & User Analysis

## Executive Summary

HeroBuilder3D targets the intersection of **visual impact** and **technical accessibility**. The core value proposition is "democratizing the 'Linear-style' 3D aesthetic" for web creators who lack the specific expertise in WebGL/Three.js or the time to build it from scratch.

## 1. Target Audience Personas & Pain Points

### A. Frontend Developers (The "React Specialist")

- **Profile**: Proficient in React, Next.js, Vue. Loves component libraries (shadcn/ui, Tailwind).
- **Specific Pain Points**:
  - **"The Three.js Learning Curve"**: Knows they need `Canvas` and `Mesh`, but struggles with the math (quaternions, vectors) and lighting physics.
  - **Boilerplate Fatigue**: Hates setting up the same scene initialization code (lights, camera, controls) every time.
  - **Integration Hell**: Finds it difficult to make 3D canvas backgrounds responsive and performant alongside DOM elements (z-index issues, scroll jank).
- **Why HeroBuilder3D?**: Delivers a copy-pasteable `<Component />` that just works. It's "Tailwind for 3D".

### B. Web Developers (The "Full Stack / Agency Generalist")

- **Profile**: Builds complete sites for clients. Juggles backend, database, and frontend. Values speed and "good enough" excellence.
- **Specific Pain Points**:
  - **Time vs. Value**: Cannot justify spending 3 days tweaking a 3D cube for a client's $5k website.
  - **Asset Pipeline**: Doesn't know how to use Blender to export GLTF files correctly (textures missing, file size too big).
  - **Client Revisions**: Client says "make it blue" or "make it spin faster" - in code, this is a headache. In a builder, it's a slider.
- **Why HeroBuilder3D?**: Rapid prototyping. Can show a client 3 variations in 5 minutes using AI synthesis.

### C. No-Code Developers (The "Webflow / Framer Pro")

- **Profile**: Visual thinkers. Uses Webflow, Framer, or WordPress. Often former graphic designers.
- **Specific Pain Points**:
  - **Static Limitations**: Their sites look great but feel "flat" compared to Awwwards winners.
  - **Heavy Video Files**: Tries to solve the 3D look by using heavy MP4 loops that kill page load speed and SEO.
  - **Spline is Overkill**: Finds Spline too complex for simple "floating abstract shapes" and doesn't want to learn 3D modeling.
- **Why HeroBuilder3D?**: The `<iframe>` or simple script embed allows them to drop high-end interactive 3D into a "Custom Code" block without writing a single line of Javascript.

## 2. Market Positioning & Pricing Strategy

### Value Metrics

- **Time Saved**: 10+ hours of Three.js boilerplate setup.
- **Asset Quality**: Professional lighting/materials that look expensive.
- **Performance**: Optimized code that doesn't crash browsers (unlike amateur WebGL).

### Pricing Tiers (Hypothetical)

1.  **Hobbyist (Free)**:
    - Watermarked exports.
    - Basic shapes only.
    - Public project visibility.
2.  **Pro Creator ($19/mo)**:
    - React/Code exports.
    - No watermark.
    - Advanced materials (Glass, Diamond).
    - AI Theme Generation.
3.  **Agency ($49/mo)**:
    - Unlimited projects.
    - White-label embeds for clients.
    - Team sharing.

## 3. Competitor Landscape & "Outsmarting" Strategy

### The Giants: Spline & Dora

- **Spline**: The "Figma for 3D". Powerful, granular, but complex.
- **Dora**: The "Webflow for 3D". Integrated builder, but platform lock-in.

### Strategy A: The "IKEA vs. Lumber" Approach (Vs. Spline)

- **The Insight**: Spline sells users the lumber, saw, and screws (Modeling Tools). It requires skill and time to build a chair.
- **Our Move**: We sell the flat-pack chair (Composition Tools).
- **Tactical Execution**:
  - **No "Blank Canvas"**: Never start the user with an empty scene. Always start with a beautiful, lit, rotating object.
  - **Curated Constraints**: Spline lets you break things with 1000 settings. We offer 10 sliders that _always_ look good together.
  - **The "One-Click" Promise**: "Make it Glass" in Spline takes 5 material node adjustments. In HeroBuilder3D, it's one button.

### Strategy B: The "Plugin vs. Platform" Approach (Vs. Dora)

- **The Insight**: Dora demands you migrate your entire website to their hosting to get the 3D benefits. This is a non-starter for devs with existing Next.js/React apps.
- **Our Move**: We are a "Trojan Horse" component.
- **Tactical Execution**:
  - **Stack Agnostic**: We don't care if you use Vercel, Netlify, WordPress, or Shopify. We just give you the code/embed.
  - **Zero Lock-in**: Dora owns your site. With us, once you export the React code, you own it forever. You can cancel your subscription and keep the code.
  - **Performance First**: Dora sites can be heavy. We optimize specifically for the "Hero Section" use case, ensuring the rest of the site loads fast.

## 4. Feature Roadmap for Growth

1.  **Templates Library**: "SaaS Dark Mode", "Corporate Clean", "Cyberpunk". Users buy outcomes, not tools.
2.  **Scroll Animations**: The #1 request from designers. "Move the object as I scroll down."
3.  **Asset Import**: Allow users to upload their own `.glb` logo files to apply our materials/lighting to them.
