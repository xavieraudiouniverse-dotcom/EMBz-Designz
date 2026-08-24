{
  "design_system_name": "EMBZ / EXISTEANCE — Neon Love Letter (Street x Tech)",
  "brand_attributes": [
    "limited-drop streetwear",
    "cyber-night tech",
    "romantic undercurrent",
    "high-contrast + accessible",
    "tactile (grain/sticker) but performant"
  ],
  "visual_personality": {
    "summary": "A dark, high-contrast storefront that feels like a limited-drop streetwear label in a neon night city — with a love-letter thread (magenta/rose accents, heart motifs, tender microcopy). Surfaces are matte-black concrete + glass panels; accents are neon-cyan + acid-lime + rose-magenta. Use sticker/tag shapes, subtle scanlines, and micro-glows on interaction.",
    "do": [
      "Use ONE texture per surface (grain OR grid OR scanlines)",
      "Keep neon as accents (rings, borders, badges, focus) not as large gradients",
      "Use oversized condensed headings + clean grotesk body",
      "Use sticker-like badges for drops, shipping, and promos",
      "Use romantic microcopy in small doses (love-letter band, empty states)"
    ],
    "avoid": [
      "Purple-heavy gradients (prohibited by rules)",
      "Neon text for paragraphs",
      "Multiple stacked overlays on the same card",
      "Center-aligned whole app layouts"
    ]
  },
  "typography": {
    "google_fonts": {
      "display": {
        "name": "Bebas Neue",
        "usage": "H1/H2, product name highlights, drop banners",
        "fallback": "ui-sans-serif, system-ui"
      },
      "body": {
        "name": "Space Grotesk",
        "usage": "Body, UI labels, forms, navigation",
        "fallback": "ui-sans-serif, system-ui"
      },
      "mono": {
        "name": "IBM Plex Mono",
        "usage": "SKU, production time, shipping speed labels, admin tables",
        "fallback": "ui-monospace, SFMono-Regular"
      }
    },
    "tailwind_font_tokens": {
      "font-display": "'Bebas Neue', ui-sans-serif, system-ui",
      "font-sans": "'Space Grotesk', ui-sans-serif, system-ui",
      "font-mono": "'IBM Plex Mono', ui-monospace"
    },
    "text_size_hierarchy": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-display tracking-[0.02em]",
      "h2": "text-base md:text-lg font-sans text-muted-foreground",
      "body": "text-sm md:text-base font-sans leading-relaxed",
      "small": "text-xs font-mono uppercase tracking-[0.14em]"
    },
    "type_rules": [
      "Headings: tight leading (leading-[0.95]) + slight tracking",
      "Body: never pure white; use softened foreground token",
      "Use mono for metadata chips (production time, shipping, SKU)"
    ]
  },
  "color_palette": {
    "hex_palette": {
      "ink": "#07080B",
      "ink_2": "#0D0F14",
      "panel": "#10131A",
      "panel_2": "#141925",
      "text": "#E9ECF2",
      "text_muted": "#A7B0C0",
      "border": "#232A3A",
      "cyan": "#00E5FF",
      "lime": "#B8FF2C",
      "rose": "#FF3D8D",
      "rose_soft": "#FF7AB6",
      "warning": "#FFB020",
      "success": "#2DFFB2",
      "danger": "#FF4D4D"
    },
    "shadcn_hsl_tokens": {
      ":root": {
        "background": "210 20% 98%",
        "foreground": "222 47% 11%",
        "card": "0 0% 100%",
        "card-foreground": "222 47% 11%",
        "popover": "0 0% 100%",
        "popover-foreground": "222 47% 11%",
        "primary": "222 47% 11%",
        "primary-foreground": "210 20% 98%",
        "secondary": "210 16% 93%",
        "secondary-foreground": "222 47% 11%",
        "muted": "210 16% 93%",
        "muted-foreground": "215 16% 40%",
        "accent": "188 100% 50%",
        "accent-foreground": "222 47% 11%",
        "destructive": "0 84% 60%",
        "destructive-foreground": "210 20% 98%",
        "border": "214 18% 86%",
        "input": "214 18% 86%",
        "ring": "188 100% 50%",
        "chart-1": "188 100% 50%",
        "chart-2": "84 100% 58%",
        "chart-3": "334 100% 62%",
        "chart-4": "158 100% 58%",
        "chart-5": "38 100% 56%",
        "radius": "0.9rem"
      },
      ".dark": {
        "background": "225 22% 4%",
        "foreground": "220 18% 92%",
        "card": "225 22% 7%",
        "card-foreground": "220 18% 92%",
        "popover": "225 22% 7%",
        "popover-foreground": "220 18% 92%",
        "primary": "220 18% 92%",
        "primary-foreground": "225 22% 7%",
        "secondary": "225 18% 12%",
        "secondary-foreground": "220 18% 92%",
        "muted": "225 18% 12%",
        "muted-foreground": "220 10% 70%",
        "accent": "188 100% 50%",
        "accent-foreground": "225 22% 7%",
        "destructive": "0 84% 60%",
        "destructive-foreground": "220 18% 92%",
        "border": "225 18% 18%",
        "input": "225 18% 18%",
        "ring": "188 100% 50%",
        "chart-1": "188 100% 50%",
        "chart-2": "84 100% 58%",
        "chart-3": "334 100% 62%",
        "chart-4": "158 100% 58%",
        "chart-5": "38 100% 56%"
      }
    },
    "semantic_usage": {
      "primary_action": "cyan",
      "secondary_action": "panel_2",
      "romance_accent": "rose",
      "urgency": "warning",
      "success": "success",
      "danger": "danger"
    }
  },
  "textures_gradients": {
    "gradient_policy": {
      "allowed": [
        "Hero background only (<=20% viewport)",
        "Large decorative overlays behind hero", 
        "Never on text-heavy surfaces"
      ],
      "recommended_hero_gradient": "radial-gradient(900px circle at 20% 10%, rgba(0,229,255,0.18), transparent 55%), radial-gradient(700px circle at 80% 30%, rgba(255,61,141,0.14), transparent 60%), linear-gradient(180deg, #07080B 0%, #0D0F14 60%, #07080B 100%)"
    },
    "noise_overlay": {
      "use": "Keep existing .noise pattern but switch blend-mode to 'overlay' in dark mode and reduce opacity.",
      "css": ".noise::before{opacity:0.05;mix-blend-mode:overlay;}"
    },
    "scanlines_overlay": {
      "use": "Optional global overlay for hero only (not on product grids).",
      "css": ".scanlines{background:repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 2px, transparent 6px);opacity:0.35;mix-blend-mode:overlay;}"
    },
    "grid_texture": {
      "use": "Use on empty states / admin studio header band.",
      "css": ".tech-grid{background-image:linear-gradient(rgba(0,229,255,0.08) 1px, transparent 1px),linear-gradient(90deg, rgba(0,229,255,0.08) 1px, transparent 1px);background-size:32px 32px;}"
    }
  },
  "layout_grid_spacing": {
    "container": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    "rhythm": {
      "section_y": "py-12 sm:py-16 lg:py-20",
      "stack_gap": "gap-6 sm:gap-8",
      "card_padding": "p-4 sm:p-5",
      "radius": "rounded-[var(--radius)]"
    },
    "catalog_grid": {
      "mobile": "grid-cols-2 gap-3",
      "tablet": "sm:grid-cols-3 sm:gap-4",
      "desktop": "lg:grid-cols-4 lg:gap-5",
      "wide": "2xl:grid-cols-5"
    },
    "shop_layout": {
      "pattern": "Left filter rail (sticky) + right product grid",
      "classes": "grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10"
    }
  },
  "components": {
    "component_path": {
      "button": "/app/frontend/src/components/ui/button.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "slider": "/app/frontend/src/components/ui/slider.jsx",
      "pagination": "/app/frontend/src/components/ui/pagination.jsx",
      "sheet_drawer_cart": "/app/frontend/src/components/ui/sheet.jsx OR /app/frontend/src/components/ui/drawer.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "table_admin": "/app/frontend/src/components/ui/table.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "sonner_toasts": "/app/frontend/src/components/ui/sonner.jsx"
    },
    "buttons": {
      "shape": "Iconic / Action-First + Glass hints",
      "base": "relative inline-flex items-center justify-center font-sans text-sm rounded-[calc(var(--radius)-2px)]",
      "primary": {
        "classes": "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-[0_0_0_1px_rgba(0,229,255,0.35),0_10px_30px_rgba(0,229,255,0.12)] hover:shadow-[0_0_0_1px_rgba(0,229,255,0.55),0_14px_40px_rgba(0,229,255,0.18)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
        "micro": "On hover: subtle neon bloom; On press: scale 0.98"
      },
      "secondary": {
        "classes": "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border border-[hsl(var(--border))] hover:border-[rgba(0,229,255,0.45)] hover:shadow-[0_0_0_1px_rgba(0,229,255,0.18)] active:scale-[0.98]"
      },
      "ghost": {
        "classes": "bg-transparent text-[hsl(var(--foreground))] hover:bg-[rgba(255,255,255,0.04)] hover:text-[hsl(var(--foreground))]"
      },
      "romance_cta": {
        "use": "Only for love-letter band CTA (e.g., 'Send this drop to your person')",
        "classes": "bg-[rgba(255,61,141,0.14)] text-[hsl(var(--foreground))] border border-[rgba(255,61,141,0.35)] hover:bg-[rgba(255,61,141,0.18)] hover:shadow-[0_0_0_1px_rgba(255,61,141,0.25),0_14px_40px_rgba(255,61,141,0.10)]"
      }
    },
    "product_card": {
      "surface": "Matte panel with subtle border + hover neon edge",
      "classes": "group relative overflow-hidden rounded-[var(--radius)] bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
      "hover": "hover:border-[rgba(0,229,255,0.45)] hover:shadow-[0_0_0_1px_rgba(0,229,255,0.18),0_18px_50px_rgba(0,0,0,0.45)]",
      "image": "Use AspectRatio; add a top-left sticker badge overlay",
      "badges": {
        "drop": "Badge variant with clip-path sticker edge",
        "shipping": "Mono chip: 'FASTEST' / 'CHEAPEST'"
      }
    },
    "badges_stickers": {
      "sticker_shape_css": "clip-path: polygon(0% 10%, 6% 0%, 94% 0%, 100% 12%, 100% 90%, 94% 100%, 6% 100%, 0% 88%);",
      "variants": {
        "drop": "bg-[rgba(184,255,44,0.14)] text-[hsl(var(--foreground))] border border-[rgba(184,255,44,0.35)]",
        "new": "bg-[rgba(0,229,255,0.14)] border border-[rgba(0,229,255,0.35)]",
        "love": "bg-[rgba(255,61,141,0.14)] border border-[rgba(255,61,141,0.35)]"
      }
    },
    "forms": {
      "inputs": "bg-[rgba(255,255,255,0.03)] border-[hsl(var(--border))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] placeholder:text-[rgba(233,236,242,0.45)]",
      "select": "Same surface as inputs; dropdown panel uses card token",
      "validation": "Errors use destructive token; helper text uses muted-foreground"
    },
    "navigation": {
      "topbar": "Sticky, translucent glass with grain; left aligned brand; right actions",
      "classes": "sticky top-0 z-50 backdrop-blur-md bg-[rgba(7,8,11,0.72)] border-b border-[rgba(35,42,58,0.8)]",
      "brand_lockup": "Use Bebas Neue + small mono tagline: 'LOVE LETTERS IN NEON'"
    },
    "cart_drawer": {
      "use": "Sheet/Drawer with strong hierarchy: items -> shipping estimate -> subtotal -> checkout",
      "surface": "bg-[hsl(var(--card))] border-l border-[hsl(var(--border))]",
      "quantity_controls": "Use Button size=icon; show +/- with hover glow"
    },
    "admin_studio": {
      "tone": "More utilitarian: grid texture header band + mono labels",
      "table": "Use shadcn Table; zebra rows via bg-white/3%",
      "import_grid": "Use Card tiles with status badges (Imported/Failed)"
    }
  },
  "motion_microinteractions": {
    "library": "framer-motion (already available)",
    "principles": [
      "Fast, snappy: 150–220ms for hover; 260–420ms for page transitions",
      "Use subtle scale (1.01–1.03) and glow bloom on hover",
      "Stagger product grid entrance (50–90ms) for perceived performance",
      "Glitch only on hero headline or drop badge; never on body text"
    ],
    "framer_scaffolds_js": {
      "stagger_container": "const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };",
      "stagger_item": "const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } };",
      "hover_card": "whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}"
    }
  },
  "love_story_motif": {
    "usage": [
      "A 'Love Letter' band on Home: short romantic copy + rose accent button",
      "Heart waveform icon as subtle divider (SVG) in hero and order confirmation",
      "Use rose accent for wishlist-like moments (if exists) or 'Gift this' CTA",
      "Empty states: 'No results — maybe it wasn’t meant to be. Try another tag.'"
    ],
    "heart_svg_guidance": {
      "rule": "Use inline SVG (not emoji).",
      "css": ".heart-glow{filter:drop-shadow(0 0 10px rgba(255,61,141,0.35));}"
    }
  },
  "accessibility": {
    "contrast": [
      "Body text uses foreground token (not neon)",
      "Focus rings always visible: ring + ring-offset",
      "Buttons must have >= 4.5:1 contrast"
    ],
    "reduced_motion": "Respect prefers-reduced-motion: disable scanline animation and reduce hover transforms.",
    "keyboard": "All menus, dialogs, drawers rely on shadcn primitives (already accessible)."
  },
  "data_testid_rules": {
    "convention": "kebab-case describing role",
    "must_apply_to": [
      "primary CTAs (add-to-cart, checkout, stripe redirect)",
      "search input",
      "filters (category, sort)",
      "pagination controls",
      "variant selectors",
      "cart quantity +/-",
      "shipping option radios",
      "order tracking input + submit",
      "admin import buttons, save buttons, status badges",
      "error banners and empty states"
    ],
    "examples": [
      "data-testid=\"catalog-search-input\"",
      "data-testid=\"product-card-add-to-cart-button\"",
      "data-testid=\"cart-drawer-checkout-button\"",
      "data-testid=\"shipping-method-fastest-radio\"",
      "data-testid=\"order-tracking-submit-button\""
    ]
  },
  "image_urls": {
    "hero": [
      {
        "url": "https://images.pexels.com/photos/38069557/pexels-photo-38069557.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "description": "Romantic silhouette against neon city skyline — use as Home hero background with dark overlay.",
        "category": "home-hero"
      },
      {
        "url": "https://images.pexels.com/photos/18432134/pexels-photo-18432134.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "description": "Streetwear couple in futuristic city lighting — use for brand story band.",
        "category": "home-story"
      }
    ],
    "product_mood": [
      {
        "url": "https://images.pexels.com/photos/29541463/pexels-photo-29541463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "description": "Neon-lit sneakers on dark surface — use as category header / promo tile.",
        "category": "category-promo"
      }
    ],
    "textures": [
      {
        "url": "https://images.unsplash.com/photo-1529753253655-470be9a42781?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "description": "Dark stone/concrete texture — optional subtle background for hero overlay (very low opacity).",
        "category": "texture"
      }
    ]
  },
  "instructions_to_main_agent": [
    "Update /app/frontend/src/index.css: replace existing warm tokens with the provided HSL tokens; set body font to Space Grotesk; headings to Bebas Neue; keep mono as IBM Plex Mono.",
    "Update tailwind.config to include fontFamily.display and fontFamily.sans per tokens.",
    "Keep dark mode as primary: ensure <html class=\"dark\"> or app-level theme default is dark.",
    "Apply product card classes to existing catalog cards; add sticker badges using Badge + clip-path.",
    "Use Sheet/Drawer for cart; ensure checkout CTA uses primary button styling.",
    "Add hero background gradient (<=20% viewport) + optional scanlines overlay only in hero.",
    "Add data-testid attributes to all interactive and key informational elements per rules.",
    "Do not change flows or page structure; only classNames/tokens/visual components."
  ],
  "extra_libraries": {
    "recommended": [
      {
        "name": "framer-motion",
        "use": "staggered entrances, hover lift, subtle page transitions",
        "install": "npm i framer-motion",
        "notes": "If already installed, just use it. Respect prefers-reduced-motion."
      }
    ],
    "optional": [
      {
        "name": "lottie-react",
        "use": "Order success micro-animation (heart pulse / neon check)",
        "install": "npm i lottie-react",
        "notes": "Use only on success page; lazy-load to keep catalog fast."
      }
    ]
  }
}

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
