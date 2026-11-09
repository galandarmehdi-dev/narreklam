import type { Dict } from '@/i18n/az';
import type { QuoteFieldKey } from './types';

export interface QuoteFieldDef {
  key: QuoteFieldKey;
  type: 'text' | 'number' | 'select' | 'textarea';
  label: (t: Dict) => string;
  placeholder?: (t: Dict) => string;
  options?: (t: Dict) => string[];
}

/** Context-sensitive quote fields. Services declare which ones apply (services.quote_fields). */
export const QUOTE_FIELDS: Record<QuoteFieldKey, QuoteFieldDef> = {
  quantity: { key: 'quantity', type: 'text', label: (t) => t.quote.extra.quantity, placeholder: () => '100' },
  dimensions: { key: 'dimensions', type: 'text', label: (t) => t.quote.extra.dimensions, placeholder: (t) => t.quote.extra.dimensionsPh },
  material: { key: 'material', type: 'text', label: (t) => t.quote.extra.material },
  sides: { key: 'sides', type: 'select', label: (t) => t.quote.extra.sides, options: (t) => t.quote.extra.sidesOptions },
  finish: { key: 'finish', type: 'text', label: (t) => t.quote.extra.finish, placeholder: (t) => t.quote.extra.finishPh },
  vehicleType: { key: 'vehicleType', type: 'text', label: (t) => t.quote.extra.vehicleType, placeholder: (t) => t.quote.extra.vehicleTypePh },
  coverage: { key: 'coverage', type: 'select', label: (t) => t.quote.extra.coverage, options: (t) => t.quote.extra.coverageOptions },
  garmentType: { key: 'garmentType', type: 'text', label: (t) => t.quote.extra.garmentType, placeholder: (t) => t.quote.extra.garmentTypePh },
  printPlacement: { key: 'printPlacement', type: 'text', label: (t) => t.quote.extra.printPlacement, placeholder: (t) => t.quote.extra.printPlacementPh },
  sizes: { key: 'sizes', type: 'text', label: (t) => t.quote.extra.sizes, placeholder: (t) => t.quote.extra.sizesPh },
  platform: { key: 'platform', type: 'select', label: (t) => t.quote.extra.platform, options: (t) => t.quote.extra.platformOptions },
  installation: { key: 'installation', type: 'select', label: (t) => t.quote.extra.installation, options: (t) => t.quote.extra.installationOptions },
};

export const ALL_QUOTE_FIELD_KEYS = Object.keys(QUOTE_FIELDS) as QuoteFieldKey[];
