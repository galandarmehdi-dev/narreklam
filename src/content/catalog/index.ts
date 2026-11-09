import type { Category, Service } from '@/lib/types';
import { buildCategory, type CategoryDef } from './helpers';
import { design } from './design';
import { space } from './space';
import { print } from './print';
import { production } from './production';
import { promo } from './promo';
import { digital } from './digital';

/**
 * Default service catalog. Used for prerendering, as the offline fallback and as
 * the source for `supabase/seed.sql` (npm run seed:generate). Once Supabase is
 * connected, the database becomes the source of truth and is edited in /admin.
 */
const defs: CategoryDef[] = [design, space, print, production, promo, digital];

const built = defs.map((d, i) => buildCategory(d, i));
export const defaultCategories: Category[] = built.map((b) => b.category);
export const defaultServices: Service[] = built.flatMap((b) => b.services);
