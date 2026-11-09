import type { ArtVariant, FaqItem, PortfolioProject } from '@/lib/types';
import { artDataUri } from '@/lib/art';
import { l } from './catalog/helpers';

/**
 * DEMONSTRATION projects — NOT real NarReklam work.
 * Shown only when VITE_SHOW_DEMO=true and no real projects exist, always labelled "Demo".
 * They are never seeded as public rows (the SQL seed marks them is_demo + unpublished).
 */
const demo = (
  slug: string,
  categoryId: string,
  serviceIds: string[],
  art: ArtVariant,
  title: [string, string, string],
  summary: [string, string, string],
  seed: number,
  featured = true,
): PortfolioProject => ({
  id: `demo-${slug}`,
  slug: `demo-${slug}`,
  categoryId,
  serviceIds,
  title: l(...title),
  summary: l(...summary),
  description: l(
    'Bu demo layihə portfolio səhifəsinin dizaynını göstərmək üçündür. Real layihələr admin paneldən əlavə edildikdə avtomatik olaraq gizlənir.',
    'Этот демо-проект показывает дизайн страницы портфолио. Он автоматически скрывается, когда в админ-панели добавлены реальные проекты.',
    'This demo project illustrates the portfolio page design. It is hidden automatically once real projects are added in the admin dashboard.',
  ),
  scope: l('Demo: dizayn, istehsalat, quraşdırma', 'Демо: дизайн, производство, монтаж', 'Demo: design, production, installation'),
  materials: l('—', '—', '—'),
  clientName: null,
  projectDate: null,
  location: null,
  coverImageId: null,
  images: [0, 1, 2].map((i) => ({
    id: `demo-${slug}-${i}`,
    url: artDataUri(art, seed + i * 7, 1200, 900),
    alt: l('Demo illüstrasiya', 'Демо-иллюстрация', 'Demo illustration'),
    order: i,
  })),
  published: true,
  featured,
  isDemo: true,
  order: seed,
});

export const demoProjects: PortfolioProject[] = [
  demo('storefront', 'advertising-production', ['outdoor-advertising', 'exterior-design'], 'production', ['Demo · Fasad lövhəsi', 'Демо · Фасадная вывеска', 'Demo · Façade sign'], ['3D hərflər və lightbox konsepti', 'Объёмные буквы и лайтбокс', '3D letters and lightbox concept'], 3),
  demo('cafe-identity', 'design-creative', ['graphic-design', 'branding', 'polygraphy'], 'design', ['Demo · Kafe brendi', 'Демо · Бренд кафе', 'Demo · Café identity'], ['Loqo, menyu və qablaşdırma', 'Логотип, меню и упаковка', 'Logo, menu and packaging'], 11),
  demo('fleet', 'branding-promo', ['vehicle-branding'], 'promo', ['Demo · Park brendinqi', 'Демо · Брендинг автопарка', 'Demo · Fleet branding'], ['Furqonlar üçün vahid dizayn', 'Единый дизайн фургонов', 'Unified van design'], 19),
  demo('expo-stand', 'advertising-production', ['interior-advertising', '3d-visualization'], 'space', ['Demo · Sərgi stendi', 'Демо · Выставочный стенд', 'Demo · Exhibition stand'], ['3D konsept və istehsalat', '3D-концепция и производство', '3D concept and production'], 27),
  demo('print-kit', 'printing-polygraphy', ['polygraphy', 'large-format-printing'], 'print', ['Demo · Çap dəsti', 'Демо · Печатный комплект', 'Demo · Print kit'], ['Vizitkart, buklet və banner', 'Визитки, буклет и баннер', 'Business cards, booklet, banner'], 35, false),
  demo('social', 'digital-advertising', ['social-media-marketing'], 'digital', ['Demo · Sosial media', 'Демо · Соцсети', 'Demo · Social media'], ['Kontent planı və vizual seriya', 'Контент-план и визуальная серия', 'Content plan and visual series'], 43, false),
];

/** General FAQ defaults (editable in Admin → FAQ once Supabase is connected). */
export const defaultFaq: FaqItem[] = [
  [
    l('Qiymətləri saytda niyə görmürəm?', 'Почему на сайте нет цен?', 'Why are there no prices on the website?'),
    l('Reklam məhsulunun qiyməti ölçü, material, say, bitmə və quraşdırma şəraitindən asılıdır. Buna görə hər sorğu üçün fərdi qiymət təklifi hazırlayırıq.', 'Стоимость рекламного изделия зависит от размера, материала, тиража, отделки и условий монтажа. Поэтому на каждую заявку мы готовим индивидуальный расчёт.', 'The price of an advertising product depends on size, material, quantity, finish and installation conditions, so we prepare an individual quotation for every request.'),
  ],
  [
    l('Hazır dizaynım yoxdur. Kömək edə bilərsiniz?', 'У меня нет готового дизайна. Поможете?', "I don't have a design. Can you help?"),
    l('Bəli. Dizayn komandamız ideyanızı sıfırdan vizuala çevirə, sonra isə istehsalata hazırlaya bilər.', 'Да. Наша дизайн-команда превратит идею в визуал с нуля и подготовит его к производству.', 'Yes. Our design team can turn your idea into a visual from scratch and prepare it for production.'),
  ],
  [
    l('Hansı fayl formatlarını qəbul edirsiniz?', 'Какие форматы файлов вы принимаете?', 'Which file formats do you accept?'),
    l('Sorğu formasında PDF, JPG, PNG, SVG, AI, EPS, PSD və ZIP fayllarını yükləyə bilərsiniz. Çap üçün vektor formatlar (AI, EPS, PDF, SVG) daha yaxşı nəticə verir.', 'В форме заявки можно загрузить PDF, JPG, PNG, SVG, AI, EPS, PSD и ZIP. Для печати лучше векторные форматы (AI, EPS, PDF, SVG).', 'You can upload PDF, JPG, PNG, SVG, AI, EPS, PSD and ZIP files in the request form. Vector formats (AI, EPS, PDF, SVG) give the best print results.'),
  ],
  [
    l('Sifariş nə qədər vaxt aparır?', 'Сколько времени занимает заказ?', 'How long does an order take?'),
    l('Müddət məhsulun növündən, sayından və dizayn mərhələsindən asılıdır. İstədiyiniz tarixi sorğuda göstərin — real müddəti qiymət təklifi ilə birlikdə bildirəcəyik.', 'Срок зависит от вида изделия, тиража и этапа дизайна. Укажите желаемую дату в заявке — реальный срок сообщим вместе с расчётом.', 'Timing depends on the product, quantity and design stage. Add your preferred date to the request and we will confirm a realistic timeline with the quotation.'),
  ],
  [
    l('Quraşdırma xidməti göstərirsiniz?', 'Вы выполняете монтаж?', 'Do you provide installation?'),
    l('Lövhə və reklam konstruksiyaları kimi məhsullar üçün quraşdırma tələb olunduqda ayrıca planlaşdırılır. Sorğuda ünvanı və quraşdırma ehtiyacını qeyd edin.', 'Для вывесок и рекламных конструкций монтаж при необходимости планируется отдельно. Укажите в заявке адрес и потребность в монтаже.', 'For products such as signs and advertising structures, installation is planned separately where needed. Include the address and installation needs in your request.'),
  ],
  [
    l('Sorğu göndərdikdən sonra nə baş verir?', 'Что происходит после отправки заявки?', 'What happens after I send a request?'),
    l('Sorğu nömrəsi alırsınız, komandamız isə detalları nəzərdən keçirib seçdiyiniz üsulla — zəng, WhatsApp və ya e-poçtla — əlaqə saxlayır.', 'Вы получаете номер заявки, а наша команда изучает детали и связывается с вами выбранным способом — звонком, в WhatsApp или по почте.', 'You receive a request number, and our team reviews the details and contacts you by your chosen method — phone, WhatsApp or email.'),
  ],
].map(([question, answer], i) => ({ id: `faq-${i + 1}`, order: i, published: true, question, answer }));
