---
name: Modern Educational SaaS
colors:
  surface: '#faf8ff'
  surface-dim: '#d3d9f3'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dbe2fc'
  on-surface: '#141b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#293044'
  inverse-on-surface: '#eef0ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#4b4bd2'
  primary: '#4141c8'
  on-primary: '#ffffff'
  primary-container: '#5b5ce2'
  on-primary-container: '#f2efff'
  inverse-primary: '#c1c1ff'
  secondary: '#565e75'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fe'
  on-secondary-container: '#5c647b'
  tertiary: '#006239'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b7d4b'
  on-tertiary-container: '#beffd2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1dfff'
  primary-fixed-dim: '#c1c1ff'
  on-primary-fixed: '#08006b'
  on-primary-fixed-variant: '#322fba'
  secondary-fixed: '#dae2fe'
  secondary-fixed-dim: '#bec6e1'
  on-secondary-fixed: '#131b2f'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#95f7b9'
  tertiary-fixed-dim: '#79da9e'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#00522f'
  background: '#faf8ff'
  on-background: '#141b2e'
  surface-variant: '#dbe2fc'
typography:
  page-title:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  page-title-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  section-title:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-default:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  metadata-regular:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  metadata-medium:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-1: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-5: 20px
  space-6: 24px
  space-8: 32px
---

## Brand & Style

This design system establishes a focused, structured, and highly legible environment for modern educational platforms. Built for educators, administrators, and students, the interface prioritizes clarity, cognitive ease, and academic utility. The aesthetic blends modern SaaS ergonomics with refined corporate restraint: crisp lines, flat structural borders, and clean typographic hierarchy eliminate visual noise.

Interactions are immediate, low-latency, and strictly purposeful. The system strictly avoids decorative excess—eschewing heavy drop shadows, neon flares, glassmorphism, and background gradients. The sole visual accent exists within subtle brand marks. The resulting experience feels dependable, scholarly, and frictionless.

## Colors

The color palette is built around contrast, role specialization, and accessible state signaling:

- **Primary (`#5B5CE2`)**: Reserved strictly for high-priority interactive touchpoints, active navigation indicators, and key system prompts. Maximize impact by limiting usage.
- **Sidebar & Core Framing (`#121A2E`)**: Dark structural container anchoring navigation, providing clear architectural separation from workspace content.
- **Canvas / Background (`#F4F6FB`)**: Soft, cool canvas tint minimizing eye strain during prolonged reading and administrative tasks.
- **Surface / Cards (`#FFFFFF`)**: Pure white operational plane for discrete content modules, data tables, and input groups.
- **Text Primary (`#192033`)**: High-contrast, near-black tone ensuring effortless legibility across dense content.
- **Text Secondary (`#687188`)**: Controlled slate for meta-labels, helper instructions, and contextual annotations.
- **Borders & Dividers (`#E1E5EE`)**: Uniform structural hairline separating layout tiers without visual heaviness.

### Semantic Status Badges
Status indicators must always use three-part styling: tinted background, explicit 1px boundary, and high-contrast text.
- **Ready / Sẵn sàng**: Background `#ECFDF3`, Border `#ABEFC6`, Text `#027A48`.
- **Processing / Đang xử lý**: Background `#FFFAEB`, Border `#FEDF89`, Text `#B54708`.
- **Error / Không đọc được**: Background `#FEF3F2`, Border `#FECDCA`, Text `#B42318`.

## Typography

Typography relies entirely on `Inter` constrained exclusively to two font weights: `400` (Regular) and `500` (Medium). No semi-bold, bold, or light weights are permitted. Visual priority is dictated by size, position, and color tone rather than weight proliferation.

- **Page Title (`28px / 36px / 500`)**: Single top-level document or view anchor. Scales to `24px` on mobile breakpoints.
- **Section Title (`20px / 28px / 500`)**: Cards, table blocks, and drawer headers.
- **Body (`14px / 20px / 400 & 500`)**: Standard reading and functional interaction size. 500 weight is reserved for button labels, form labels, and active list titles.
- **Metadata (`12px / 16px / 400 & 500`)**: Badges, table header cells, captions, breadcrumbs, and timestamp indicators.

## Layout & Spacing

The layout is grounded in a predictable 4px incremental scale (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`). 

### Shell & Flow
- **Desktop (≥ 1280px)**: Persistent vertical navigation docked at `#121A2E` (260px fixed width). Workspace fills the remaining canvas on `#F4F6FB`, contained to a max-width of 1440px with `32px` page padding.
- **Tablet (768px - 1279px)**: Collapsed navigation rail or drawer overlay. Page margin steps down to `24px`. Grid arrays collapse from 3-4 columns to 2 columns with `16px` gutters.
- **Mobile (< 768px)**: Hidden navigation behind an off-canvas drawer. Content padding steps to `16px`. Multi-column blocks collapse into a strict 1-column stack.

Internal layout groups strictly enforce consistent rhythm: input groupings use `16px` vertical gaps; table and card paddings adhere to `16px` or `20px` internal padding; and discrete section containers separate at `24px` or `32px`.

## Elevation & Depth

This system intentionally excludes multi-layer ambient drop shadows, blurs, and skeuomorphic bevels. Hierarchy is established exclusively via **flat surfaces and low-contrast hairline outlines**:

- **Layer 0 (Base)**: Workspace background set to `#F4F6FB`.
- **Layer 1 (Cards & Data Panels)**: Surface color `#FFFFFF` bounded by a crisp `1px solid #E1E5EE`. No shadow is applied under resting states.
- **Layer 2 (Dropdowns & Popovers)**: `#FFFFFF` surface with `1px solid #E1E5EE` paired with a minimal utility shadow (`0 4px 12px rgba(18, 26, 46, 0.06)`) purely to prevent edge bleed over interactive siblings.
- **Layer 3 (Modals & Dialogs)**: `#FFFFFF` surface with `1px solid #E1E5EE`, floated above an ambient scrim of `#121A2E` at 40% opacity.

## Shapes

The geometric framework enforces strict proportional radii mapped to component size and role:

- **Inputs, Buttons, and Selectors**: Uniform `10px` border radius (`rounded-[10px]`).
- **Cards, Panels, and Table Enclosures**: Uniform `14px` border radius (`rounded-[14px]`).
- **Modals, Flyouts, and Central Dialogs**: Uniform `18px` border radius (`rounded-[18px]`).
- **Status Badges & Avatar Containers**: Pill-shaped (`rounded-full`) or matching base `10px` for contextual chips.

## Components

### Buttons
- **Primary Button**: Solid `#5B5CE2`, text `#FFFFFF`, height `40px`, padding `0 16px`, radius `10px`, font `14px / 500`. Hover: `#4C4DC9`. Active: `#3F40B3`. **Strict Constraint:** Maximum 1 primary button per visual region or viewport section.
- **Secondary Button**: Background `#FFFFFF`, border `1px solid #E1E5EE`, text `#192033`, height `40px`, radius `10px`. Hover: background `#F4F6FB`, border `#D0D5DD`.
- **Tertiary / Ghost Button**: Transparent background, text `#687188`, height `40px`, radius `10px`. Hover: background `#F4F6FB`, text `#192033`.

### Input Fields & Selects
- Height `40px`, background `#FFFFFF`, border `1px solid #E1E5EE`, radius `10px`, padding `0 12px`, text `#192033` (14px/400), placeholder `#687188`.
- Focus: border `1px solid #5B5CE2`, box-shadow `0 0 0 3px rgba(91, 92, 226, 0.12)`.
- Error: border `1px solid #B42318`, box-shadow `0 0 0 3px rgba(180, 35, 24, 0.12)`.

### Status Badges
- Inline-flex items, height `24px`, padding `0 8px`, border-radius `9999px`, font `12px / 500`.
- **Ready**: Background `#ECFDF3`, border `1px solid #ABEFC6`, text `#027A48`.
- **Processing**: Background `#FFFAEB`, border `1px solid #FEDF89`, text `#B54708`.
- **Error**: Background `#FEF3F2`, border `1px solid #FECDCA`, text `#B42318`.

### Cards & Data Tables
- **Cards**: Background `#FFFFFF`, border `1px solid #E1E5EE`, radius `14px`, internal padding `20px`. Header row divides using `1px solid #E1E5EE`.
- **Tables**: Contained within a `14px` rounded wrapper with border `1px solid #E1E5EE`. Header row background `#F4F6FB`, border bottom `1px solid #E1E5EE`, header text `#687188` (12px / 500). Data rows `#FFFFFF`, height `52px`, row divider `1px solid #E1E5EE`, text `#192033` (14px / 400).

### Checkboxes & Radio Buttons
- Sizing: `16px × 16px`.
- Checkbox radius `4px`, Radio radius `9999px`.
- Inactive: background `#FFFFFF`, border `1px solid #E1E5EE`.
- Checked: background `#5B5CE2`, border `1px solid #5B5CE2`, icon/dot `#FFFFFF`.

### Modals & Dialogs
- Max width `560px`, background `#FFFFFF`, border `1px solid #E1E5EE`, radius `18px`, padding `24px`. Centered against backdrop scrim `#121A2E` at 40% opacity.