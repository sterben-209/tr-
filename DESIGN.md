---
name: Calm Diary
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4b463a'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#7c7769'
  outline-variant: '#cdc6b6'
  surface-tint: '#6b5e28'
  primary: '#6b5e28'
  on-primary: '#ffffff'
  primary-container: '#ffeba7'
  on-primary-container: '#786932'
  inverse-primary: '#d8c685'
  secondary: '#3a637c'
  on-secondary: '#ffffff'
  secondary-container: '#b6dffd'
  on-secondary-container: '#3b637d'
  tertiary: '#7e5262'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffe5ec'
  on-tertiary-container: '#8a5d6d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f5e29f'
  primary-fixed-dim: '#d8c685'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#524612'
  secondary-fixed: '#c7e7ff'
  secondary-fixed-dim: '#a3cce9'
  on-secondary-fixed: '#001e2e'
  on-secondary-fixed-variant: '#204b63'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#efb7ca'
  on-tertiary-fixed: '#31101e'
  on-tertiary-fixed-variant: '#633b4a'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 20px
  gutter: 12px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is built on the narrative of a "digital scrapbook"—a safe, quiet space for introspection. It eschews the rigid, clinical perfection of standard SaaS interfaces in favor of a **minimalist, tactile, and hand-drawn aesthetic**. The brand personality is gentle, empathetic, and unassuming, designed to lower the barrier to daily journaling.

The style leverages **Organic Minimalism**. It prioritizes heavy whitespace to reduce cognitive load while introducing warmth through "perfectly imperfect" lines. Every structural element—from buttons to cards—features a custom CSS `border-radius` and `clip-path` or SVG filter to simulate the slight tremor of a hand-held pen. This human touch transforms the app from a tool into a companion.

Targeting wellness-conscious individuals and students, the UI evokes a sense of calm and creative freedom. The interface should feel like a physical notebook where the user's thoughts are the primary focus, supported by a "kawaii" yet sophisticated visual language.

## Colors

The palette is rooted in soft, sun-bleached pastels that provide high legibility without the harshness of pure white or high-saturation hues.

- **Primary (Pale Yellow):** Used for key highlights and the "mood" of optimism. It mimics the look of a sticky note or a highlight.
- **Secondary (Soft Blue):** Reserved for secondary actions and calm states, providing a cool contrast to the yellow.
- **Tertiary (Gentle Pink):** Used for moments of delight, heart icons, or emotional emphasis.
- **Neutral (Charcoal Grey):** Instead of pure black, a soft charcoal is used for text and hand-drawn outlines to maintain a graphite-pencil feel.
- **Background (Cream):** A warm, off-white paper texture serves as the foundation, reducing eye strain during night-time journaling.

Functional colors (success/error) should be muted versions of green and red, adjusted to match the pastel saturation levels.

## Typography

Typography balances the clarity of a modern sans-serif with the friendliness of rounded terminals. 

**Plus Jakarta Sans** is used for headlines to provide a subtle, professional structure that anchors the page. Its soft curves complement the hand-drawn elements without becoming illegible.

**Quicksand** is the workhorse for body text and diary entries. Its highly rounded characteristics mimic a neat, printed handwriting style, making the content feel personal and accessible. 

For the diary entry itself, font-weight should remain at 400 or 500 to ensure the text looks like ink on paper. Avoid heavy letter spacing; the goal is a tight, rhythmic flow that feels like a natural note.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous safe areas to mimic the margins of a diary page. 

- **Mobile First:** The design is centered around a single-column layout with 20px side margins. 
- **Rhythm:** Spacing follows an 8px incremental scale, but with "soft" alignment. Elements don't need to be mathematically perfect; slight offsets (1-2px) in padding can reinforce the hand-drawn feel.
- **Composition:** Use whitespace as a functional tool to separate days in the calendar view and entries in the timeline. Cards should have significant vertical breathing room to avoid a "cluttered" digital feel.

## Elevation & Depth

This system avoids realistic shadows and blurs. Instead, depth is communicated through **Stacked Tonal Layers** and **Pencil Outlines**.

1.  **Outlines:** Every elevated element (cards, buttons) is encased in a 1.5px or 2px charcoal outline. This outline should have a slight "wobble" effect using a SVG displacement map.
2.  **Flat Stacking:** Elements are visually "placed" on top of each other. To show an active state or an elevated card, use a solid, offset "shadow" block (a secondary color block shifted 4px right and 4px down) rather than a soft blur.
3.  **Tonal Tiering:** The background is the lightest color (`#FFFDF9`), while containers like diary cards use a slightly different tint (like the primary yellow) to distinguish themselves.

## Shapes

The shape language is organic and soft. Standard geometric shapes are avoided.

- **Irregularity:** While the base `roundedness` is set to level 2 (0.5rem), every component should ideally use a `border-radius` that varies slightly on each corner (e.g., `12px 8px 14px 10px`) to create an asymmetrical, hand-sketched look.
- **Circles:** Mood icons and calendar dates should use imperfect circles—more like hand-drawn "blobs" than perfect ellipses.
- **Connectors:** Lines used to separate sections should look like hand-ruled pen strokes with slightly tapered ends.

## Components

### Buttons
Primary buttons are solid-filled with the primary pastel yellow and wrapped in a thick pencil outline. On hover or tap, they should "sink" slightly by removing the offset block shadow.

### Cards
Cards for diary entries or store items use a white background with a thin, irregular charcoal border. The header of the card can feature a "washi tape" style accent in a secondary pastel color.

### Icons (Emoticons)
Mood icons are the centerpiece. They must be simple line drawings with minimal features. A "happy" mood is two dots and a simple upward curve. Avoid gradients; use flat color fills that may slightly bleed outside the lines for an "artist's sketch" effect.

### Input Fields
Instead of a box, diary inputs should look like ruled notebook lines. The cursor should be soft and the focus state highlighted by a gentle pastel glow behind the text line.

### Navigation
The bottom navigation bar uses simple line-art icons. The active state is indicated by a hand-drawn circle or a "highlight" stroke behind the icon.

### Selection States
Checkboxes and radio buttons should look like hand-drawn squares and circles. A "checked" state is represented by a hand-drawn 'X' or a colored-in "scribble."