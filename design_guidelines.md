{
  "brand": {
    "name": "EMBZ Designs / Existeance",
    "attributes": [
      "premium",
      "editorial",
      "artistic",
      "sophisticated",
      "warm-neutral",
      "photography-first",
      "conversion-focused"
    ],
    "north_star": "Feels like a high-end print magazine translated to a fast, modern storefront: warm paper backgrounds, chocolate ink typography, mustard accents used sparingly, and product photography as the hero."
  },
  "design_personality": {
    "style_fusion": [
      "Editorial / magazine layout rhythm (asymmetry, generous margins)",
      "Minimal luxury e-commerce chrome (hairline borders, no heavy shadows)",
      "Soft tactile surfaces (paper + fabric textures via subtle noise)",
      "Bento moments for campaigns + lookbook tiles (not everywhere)"
    ],
    "do_not": [
      "No centered-page reading flow (avoid global text-align:center)",
      "No loud gradients; no saturated purple/pink/blue gradients",
      "No heavy drop shadows on cards",
      "No cramped grids; keep whitespace generous",
      "No gradients on small UI elements"
    ]
  },
  "typography": {
    "google_fonts": {
      "heading_serif": {
        "name": "Bitter",
        "weights": ["400", "500", "600", "700"],
        "usage": "All H1/H2/H3, product titles, editorial quotes"
      },
      "body_sans": {
        "name": "Manrope",
        "weights": ["400", "500", "600", "700"],
        "usage": "Body, UI labels, forms, tables, filters"
      },
      "mono_optional": {
        "name": "IBM Plex Mono",
        "weights": ["400", "500"],
        "usage": "Order numbers, tracking codes, admin IDs"
      }
    },
    "tailwind_font_setup": {
      "instructions": [
        "Add Google Fonts <link> in /app/frontend/public/index.html (or equivalent) for Bitter + Manrope + IBM Plex Mono.",
        "In tailwind.config.js extend fontFamily: { serif: ['Bitter', 'ui-serif', 'Georgia'], sans: ['Manrope','ui-sans-serif','system-ui'], mono: ['IBM Plex Mono','ui-monospace'] }",
        "Use className='font-serif' for headings and 'font-sans' for body/UI."
      ]
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-serif tracking-[-0.02em]",
      "h2": "text-2xl sm:text-3xl lg:text-4xl font-serif tracking-[-0.01em]",
      "h3": "text-xl sm:text-2xl font-serif",
      "subheading": "text-base md:text-lg font-sans text-muted-foreground",
      "body": "text-sm sm:text-base font-sans leading-relaxed",
      "label_caps": "text-xs font-sans uppercase tracking-[0.14em]",
      "price": "text-base sm:text-lg font-sans font-semibold tabular-nums"
    }
  },
  "color_system": {
    "notes": [
      "Default theme is refined light.",
      "Chocolate brown is the 'ink' (primary text + primary button).",
      "Mustard is an accent for highlights, badges, and selected states (sparingly).",
      "Backgrounds are warm paper/beige; cards are slightly lighter than background for depth without shadows."
    ],
    "tokens_hex": {
      "paper": "#F6F1E7",
      "paper-2": "#EFE6D8",
      "card": "#FBF8F2",
      "ink": "#2A1E17",
      "ink-2": "#3A2A21",
      "muted-ink": "#6B5B52",
      "border": "#E2D6C6",
      "mustard": "#C9A227",
      "mustard-soft": "#E7D7A0",
      "success": "#2F6B4F",
      "danger": "#9B3A2F",
      "info": "#2F5D6B"
    },
    "css_custom_properties_hsl_for_shadcn": {
      "instructions": "Replace :root and .dark tokens in /app/frontend/src/index.css with these HSL values (keep shadcn structure).",
      "light": {
        "--background": "36 44% 93%",
        "--foreground": "22 28% 13%",
        "--card": "36 55% 96%",
        "--card-foreground": "22 28% 13%",
        "--popover": "36 55% 96%",
        "--popover-foreground": "22 28% 13%",
        "--primary": "22 28% 13%",
        "--primary-foreground": "36 55% 96%",
        "--secondary": "34 33% 88%",
        "--secondary-foreground": "22 28% 13%",
        "--muted": "34 28% 90%",
        "--muted-foreground": "22 14% 38%",
        "--accent": "44 67% 47%",
        "--accent-foreground": "22 28% 13%",
        "--destructive": "8 53% 40%",
        "--destructive-foreground": "36 55% 96%",
        "--border": "33 26% 83%",
        "--input": "33 26% 83%",
        "--ring": "44 67% 47%",
        "--radius": "0.75rem"
      },
      "dark_optional_admin": {
        "--background": "22 28% 8%",
        "--foreground": "36 44% 93%",
        "--card": "22 28% 10%",
        "--card-foreground": "36 44% 93%",
        "--popover": "22 28% 10%",
        "--popover-foreground": "36 44% 93%",
        "--primary": "36 44% 93%",
        "--primary-foreground": "22 28% 10%",
        "--secondary": "22 18% 16%",
        "--secondary-foreground": "36 44% 93%",
        "--muted": "22 18% 16%",
        "--muted-foreground": "34 18% 70%",
        "--accent": "44 67% 47%",
        "--accent-foreground": "22 28% 10%",
        "--destructive": "8 53% 45%",
        "--destructive-foreground": "36 44% 93%",
        "--border": "22 18% 18%",
        "--input": "22 18% 18%",
        "--ring": "44 67% 47%"
      }
    },
    "gradient_policy": {
      "allowed": [
        "Hero background only (max 20% viewport)",
        "Large section background bands (not behind long text)",
        "Decorative overlays"
      ],
      "recommended_gradients": [
        {
          "name": "paper-warm",
          "css": "radial-gradient(1200px circle at 20% 10%, rgba(201,162,39,0.14), transparent 55%), radial-gradient(900px circle at 80% 30%, rgba(58,42,33,0.10), transparent 60%), linear-gradient(180deg, #FBF8F2 0%, #F6F1E7 60%, #EFE6D8 100%)"
        }
      ]
    }
  },
  "layout_grid": {
    "container": "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
    "page_rhythm": [
      "Use editorial spacing: section py-12 sm:py-16; hero py-16 sm:py-20",
      "Use separators (hairline) between major sections: <Separator className='bg-border/70' />",
      "Alternate: product grid sections with a full-bleed lookbook image band to reset scroll pace"
    ],
    "catalog_grid": {
      "mobile": "grid-cols-2 gap-3",
      "tablet": "sm:grid-cols-3 sm:gap-4",
      "desktop": "lg:grid-cols-4 lg:gap-6",
      "notes": "Keep product cards consistent height; use AspectRatio for images."
    }
  },
  "components": {
    "component_path": {
      "shadcn_ui": [
        "/app/frontend/src/components/ui/button.jsx",
        "/app/frontend/src/components/ui/badge.jsx",
        "/app/frontend/src/components/ui/card.jsx",
        "/app/frontend/src/components/ui/input.jsx",
        "/app/frontend/src/components/ui/textarea.jsx",
        "/app/frontend/src/components/ui/select.jsx",
        "/app/frontend/src/components/ui/checkbox.jsx",
        "/app/frontend/src/components/ui/radio-group.jsx",
        "/app/frontend/src/components/ui/slider.jsx",
        "/app/frontend/src/components/ui/pagination.jsx",
        "/app/frontend/src/components/ui/sheet.jsx",
        "/app/frontend/src/components/ui/drawer.jsx",
        "/app/frontend/src/components/ui/dialog.jsx",
        "/app/frontend/src/components/ui/accordion.jsx",
        "/app/frontend/src/components/ui/tabs.jsx",
        "/app/frontend/src/components/ui/table.jsx",
        "/app/frontend/src/components/ui/scroll-area.jsx",
        "/app/frontend/src/components/ui/skeleton.jsx",
        "/app/frontend/src/components/ui/sonner.jsx"
      ],
      "flowbite_optional": [
        "Use only if needed for a specific pattern; prefer shadcn first."
      ]
    },
    "buttons": {
      "shape": "Luxury/Elegant: rounded-xl (12px) for primary/secondary; rounded-lg for small chips",
      "variants": {
        "primary": {
          "tailwind": "bg-primary text-primary-foreground hover:bg-primary/92 active:bg-primary/88 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "notes": "Primary should feel like chocolate ink on paper."
        },
        "secondary": {
          "tailwind": "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
          "notes": "Use for less critical actions (continue shopping, save)."
        },
        "ghost": {
          "tailwind": "hover:bg-accent/15 hover:text-foreground",
          "notes": "Use in nav + subtle actions."
        },
        "accent": {
          "tailwind": "bg-[color:var(--accent-solid)] text-primary hover:opacity-95",
          "notes": "Only for 1 key CTA per viewport (e.g., 'Shop New Drop'). Implement as custom class using mustard hex (#C9A227) if needed."
        }
      },
      "micro_interactions": [
        "Hover: translate-y-[-1px] on primary buttons only (transition-transform duration-200 ease-out)",
        "Active: scale-[0.98] (transition-transform duration-75)",
        "No transition: all; specify transition-colors, transition-shadow, transition-transform separately"
      ],
      "data_testid": [
        "data-testid='primary-cta-button'",
        "data-testid='add-to-cart-button'",
        "data-testid='checkout-submit-button'"
      ]
    },
    "product_card": {
      "structure": [
        "Card (no heavy shadow) with hairline border",
        "Image area: AspectRatio 4/5; on hover, subtle zoom (scale-105) and reveal quick actions",
        "Meta: brand label (caps), product title (serif), price (tabular nums), small badges"
      ],
      "tailwind": {
        "card": "group rounded-2xl border border-border bg-card overflow-hidden",
        "imageWrap": "relative overflow-hidden",
        "image": "h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]",
        "meta": "p-3 sm:p-4",
        "title": "font-serif text-base sm:text-lg leading-snug",
        "price": "font-sans font-semibold tabular-nums",
        "badge": "rounded-full px-2 py-0.5 text-[11px]"
      },
      "quick_actions": {
        "pattern": "On desktop hover: show 'Quick add' button + 'View' link as an overlay at bottom; on mobile: always show a small 'View' button below image.",
        "overlay_tailwind": "absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 transition-[opacity,transform] duration-200 group-hover:opacity-100 group-hover:translate-y-0"
      },
      "data_testid": [
        "data-testid='product-card'",
        "data-testid='product-card-view-button'",
        "data-testid='product-card-quick-add-button'"
      ]
    },
    "filters_search_sort": {
      "pattern": "Left filter rail on desktop; Sheet/Drawer filters on mobile. Keep search prominent and fast.",
      "components": ["Input", "Select", "Checkbox", "Slider", "Sheet", "Pagination"],
      "chip_style": {
        "tailwind": "inline-flex items-center rounded-full border border-border bg-card px-3 py-2 text-sm hover:bg-secondary/70",
        "active": "bg-primary text-primary-foreground border-primary"
      },
      "data_testid": [
        "data-testid='catalog-search-input'",
        "data-testid='catalog-sort-select'",
        "data-testid='catalog-filter-open-button'",
        "data-testid='catalog-pagination'"
      ]
    },
    "product_detail": {
      "gallery": "Use Carousel + thumbnails; keep image background neutral. Add zoom-on-hover desktop (CSS scale) and swipe on mobile.",
      "variant_selection": "Use RadioGroup for size; Select for color if many; show stock/production time as Badge.",
      "sticky_buy_box": "On desktop: sticky right column with price, variants, production time, shipping preview, Add to cart.",
      "data_testid": [
        "data-testid='pdp-title'",
        "data-testid='pdp-price'",
        "data-testid='pdp-size-radio'",
        "data-testid='pdp-color-select'",
        "data-testid='pdp-add-to-cart-button'"
      ]
    },
    "cart": {
      "pattern": "Use Sheet as cart drawer (keeps shopping context). Provide quantity stepper with +/- buttons.",
      "components": ["Sheet", "ScrollArea", "Separator", "Button"],
      "data_testid": [
        "data-testid='cart-open-button'",
        "data-testid='cart-line-item'",
        "data-testid='cart-quantity-increase-button'",
        "data-testid='cart-quantity-decrease-button'",
        "data-testid='cart-subtotal'",
        "data-testid='cart-checkout-button'"
      ]
    },
    "checkout": {
      "pattern": "Two-column on desktop: left form, right order summary card. Mobile: summary collapsible above 'Place order'.",
      "components": ["Form", "Input", "Select", "RadioGroup", "Accordion", "Card", "Sonner"],
      "shipping_quote_ui": "Show cheapest + fastest as two RadioGroup cards with small meta (ETA, cost).",
      "data_testid": [
        "data-testid='checkout-shipping-form'",
        "data-testid='checkout-country-select'",
        "data-testid='checkout-shipping-method-radio'",
        "data-testid='checkout-place-order-button'",
        "data-testid='checkout-error-message'"
      ]
    },
    "order_confirmation_tracking": {
      "confirmation": "Use Card with order number in mono, and a subtle mustard highlight bar (left border).",
      "tracking": "Simple lookup form + results timeline using Accordion or vertical list with separators.",
      "data_testid": [
        "data-testid='order-confirmation-number'",
        "data-testid='order-tracking-input'",
        "data-testid='order-tracking-submit-button'",
        "data-testid='order-tracking-status'"
      ]
    },
    "admin_dashboard": {
      "tone": "Same brand tokens but more utilitarian density; optional dark mode for long sessions.",
      "components": ["Table", "Tabs", "Select", "Badge", "Dialog", "Sonner"],
      "row_actions": "Use DropdownMenu for actions: push/cancel/hold/resume; confirm destructive actions with AlertDialog.",
      "data_testid": [
        "data-testid='admin-orders-table'",
        "data-testid='admin-order-row'",
        "data-testid='admin-order-actions-menu'",
        "data-testid='admin-order-cancel-confirm-button'"
      ]
    }
  },
  "motion_microinteractions": {
    "library": {
      "recommended": "framer-motion",
      "install": "npm i framer-motion",
      "usage_notes": [
        "Use for: staggered product grid entrance, hero text reveal, filter panel slide-in, cart drawer item add/remove animations.",
        "Respect prefers-reduced-motion: reduce durations to 0 and disable parallax."
      ]
    },
    "principles": [
      "Entrance: 12–16px y + fade, duration 0.35s, ease-out",
      "Hover: only on key interactive elements (product cards, primary buttons)",
      "Scroll: one subtle parallax band on home (lookbook image)"
    ],
    "no_universal_transition": true
  },
  "texture_and_depth": {
    "noise_overlay": {
      "css_snippet": ".noise::before{content:'';position:absolute;inset:0;background-image:url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"120\" height=\"120\" filter=\"url(%23n)\" opacity=\"0.08\"/></svg>');mix-blend-mode:multiply;pointer-events:none;border-radius:inherit;}",
      "usage": "Apply to hero background wrapper or section bands only (not on text-heavy cards)."
    },
    "shadows": {
      "rule": "Prefer borders + subtle elevation only on floating elements (dropdowns, sheets).",
      "tailwind": "shadow-[0_10px_30px_rgba(42,30,23,0.10)]"
    }
  },
  "accessibility": {
    "requirements": [
      "WCAG AA contrast for text on paper backgrounds",
      "Visible focus rings: use ring color = mustard accent",
      "Keyboard navigable filters, variant selectors, cart controls",
      "Use aria-live for cart updates and checkout errors"
    ],
    "forms": [
      "Always pair <Label htmlFor> with inputs",
      "Error text uses destructive color and role='alert'",
      "Use Input OTP only if needed (not required here)"
    ]
  },
  "performance_guidance": {
    "catalog": [
      "Use Skeleton for product grid loading",
      "Paginate server-side; avoid rendering 900+ items at once",
      "Use responsive images and lazy loading",
      "Debounce search input (150–250ms)"
    ]
  },
  "image_urls": {
    "hero_lifestyle": [
      {
        "url": "https://images.pexels.com/photos/20620137/pexels-photo-20620137.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "description": "Natural-light editorial lifestyle shot for homepage hero (warm beige tones)."
      },
      {
        "url": "https://images.unsplash.com/photo-1559279824-ff1f92a191b9?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "description": "Lookbook band image (full-bleed) to reset scroll rhythm."
      }
    ],
    "texture_fabric": [
      {
        "url": "https://images.unsplash.com/photo-1714682597753-a646ba506cee?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "description": "Soft beige fabric folds for subtle background/collection header (use with low opacity)."
      },
      {
        "url": "https://images.unsplash.com/photo-1638303322579-343c8154b80e?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "description": "Neutral fabric texture for empty states or category headers."
      }
    ],
    "accent_texture": [
      {
        "url": "https://images.pexels.com/photos/33939695/pexels-photo-33939695.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "description": "Mustard plaster texture for small decorative blocks (max 20% viewport)."
      }
    ]
  },
  "instructions_to_main_agent": {
    "global_css_changes": [
      "Remove CRA starter styles in App.css (logo spin, centered header).",
      "Update /app/frontend/src/index.css :root and .dark tokens to the provided HSL values.",
      "Set body font-family to Manrope; headings use Bitter via Tailwind font families.",
      "Add a reusable 'paper' background utility class for pages: bg-background with optional noise overlay wrapper."
    ],
    "page_skeleton": {
      "home": [
        "Hero: split layout (text left, lifestyle image right) on desktop; stacked on mobile.",
        "Featured categories: bento grid (2x2 with one tall tile) using Card + AspectRatio.",
        "Featured products: standard grid with 8–12 items.",
        "Editorial brand story band: full-width with serif quote + small CTA.",
        "Footer: minimal, no gradients, include shipping/returns links."
      ],
      "shop": [
        "Top bar: search + sort + filter button (mobile).",
        "Desktop: left filter rail (sticky) + product grid.",
        "Pagination at bottom using shadcn Pagination."
      ],
      "pdp": [
        "Two-column: gallery left, buy box right (sticky).",
        "Below: tabs/accordion for details, sizing, shipping, care."
      ],
      "checkout": [
        "Two-column: form + summary.",
        "Shipping methods as selectable cards (RadioGroup).",
        "Place order button fixed at bottom on mobile (safe-area padding)."
      ],
      "admin": [
        "Tabs for order states.",
        "Table with sticky header; actions in DropdownMenu; confirmations via AlertDialog."
      ]
    },
    "testing_attributes": [
      "Add data-testid to every button/input/select that affects cart/checkout/filtering/admin actions.",
      "Use kebab-case role-based IDs (e.g., data-testid='catalog-filter-size-checkbox')."
    ],
    "recommended_new_components_js": [
      "src/components/BrandMark.js (simple wordmark lockup)",
      "src/components/SectionHeader.js (label_caps + serif title + optional action)",
      "src/components/ProductCard.js",
      "src/components/Price.js (tabular nums + currency)",
      "src/components/FilterRail.js + MobileFilterSheet.js",
      "src/components/LookbookBand.js (full-bleed image + overlay text)"
    ]
  },
  "references": {
    "inspiration_urls": [
      "https://www.shadcn.io/design/jcrew",
      "https://www.shadcnblocks.com/block/bento38",
      "https://styles.refero.design/style/a4dcee26-dd31-415a-ac99-64299959e7f1",
      "https://commerce-ui.com/work/akris"
    ]
  },
  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>\n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
