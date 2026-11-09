/**
 * PROVISIONAL brand tokens — not the official NarReklam identity.
 * Replace these (and the matching CSS variables in src/styles/theme.css)
 * once the official palette and typography are supplied.
 */
export const brand = {
  colors: {
    nar: '#C51D34', // pomegranate red (provisional)
    narDeep: '#8E1124',
    ink: '#171717', // dark charcoal
    paper: '#F8F7F4', // off-white
    white: '#FFFFFF',
    saffron: '#F2B33D', // complementary accent
    teal: '#0E6B66', // complementary accent
    blush: '#F6D5CF',
  },
  fonts: {
    display: '"Unbounded Variable", "Unbounded", system-ui, sans-serif',
    body: '"Manrope Variable", "Manrope", system-ui, sans-serif',
  },
} as const;
