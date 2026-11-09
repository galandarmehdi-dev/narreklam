import { l, type CategoryDef } from './helpers';

// Note: no specific printing technologies, materials or finishing capabilities are promised — these are agreed per project.
export const print: CategoryDef = {
  slug: 'printing-polygraphy',
  icon: 'Printer',
  art: 'print',
  name: l('Çap və Poliqrafiya', 'Печать и полиграфия', 'Printing & Polygraphy'),
  tagline: l('Vizitkartdan dev bannerə qədər', 'От визитки до огромного баннера', 'From business cards to giant banners'),
  description: l(
    'Vizitkart, buklet, kataloq, etiket və menyulardan banner, vinil, vitrin və divar qrafikasına qədər poliqrafiya və geniş formatlı çap.',
    'Полиграфия и широкоформатная печать: от визиток, буклетов, каталогов, этикеток и меню до баннеров, винила, витринной и настенной графики.',
    'Commercial and large-format printing: from business cards, booklets, catalogues, labels and menus to banners, vinyl, window and wall graphics.',
  ),
  services: [
    {
      slug: 'polygraphy',
      icon: 'Printer',
      quoteFields: ['quantity', 'dimensions', 'sides', 'finish', 'material'],
      title: l('Poliqrafiya', 'Полиграфия', 'Polygraphic Printing'),
      short: l('Vizitkart, flayer, buklet, kataloq, etiket və digər çap məhsulları.', 'Визитки, флаеры, буклеты, каталоги, этикетки и другая печатная продукция.', 'Business cards, flyers, booklets, catalogues, labels and more.'),
      headline: l('Əldə tutulan brend: keyfiyyətli çap məhsulları.', 'Бренд, который можно взять в руки.', 'Your brand, in people’s hands.'),
      intro: l(
        'Gündəlik biznes ehtiyacları üçün bütün çap məhsullarını hazırlayırıq. Sorğuda say, ölçü, tərəflər və istədiyiniz bitməni göstərin — material və texniki həlli birlikdə seçək.',
        'Изготавливаем всю печатную продукцию для повседневных задач бизнеса. Укажите в заявке тираж, размер, стороны и желаемую отделку — материал и техническое решение подберём вместе.',
        'We produce every printed item a business needs day to day. Tell us quantity, size, sides and preferred finish — we’ll choose the material and technical solution together.',
      ),
      items: [
        ['Vizitkartlar', 'Визитки', 'Business cards (vizitkart)'],
        ['Flayerlər', 'Флаеры', 'Flyers'],
        ['Vərəqələr', 'Листовки', 'Leaflets'],
        ['Broşürlər', 'Брошюры', 'Brochures'],
        ['Bukletlər', 'Буклеты', 'Booklets'],
        ['Kataloqlar', 'Каталоги', 'Catalogs'],
        ['Menyular', 'Меню', 'Menus'],
        ['Stikerlər', 'Стикеры', 'Stickers'],
        ['Etiketlər', 'Этикетки', 'Labels (etiket)'],
        ['Dəvətnamələr', 'Пригласительные', 'Invitations'],
        ['Sertifikatlar', 'Сертификаты', 'Certificates'],
        ['Papkalar', 'Папки', 'Folders'],
        ['Posterlər', 'Постеры', 'Posters'],
        ['Korporativ dəftərxana', 'Корпоративная канцелярия', 'Corporate stationery'],
        ['Təqvimlər', 'Календари', 'Calendars'],
        ['Fərdi çap məhsulları', 'Индивидуальная печатная продукция', 'Custom printed materials'],
      ],
      applications: [
        ['Komanda üçün vizitkartlar və korporativ blanklar', 'Визитки и фирменные бланки для команды', 'Business cards and letterheads for the team'],
        ['Restoran üçün menyu və masaüstü kartlar', 'Меню и настольные карточки для ресторана', 'Menus and table cards for a restaurant'],
        ['Məhsul etiketləri və stikerlər', 'Этикетки и стикеры для продукции', 'Product labels and stickers'],
        ['Sərgi üçün kataloq və bukletlər', 'Каталоги и буклеты для выставки', 'Catalogues and booklets for an exhibition'],
      ],
      faq: [
        {
          q: l('Minimum sifariş sayı varmı?', 'Есть ли минимальный тираж?', 'Is there a minimum order quantity?'),
          a: l('Minimum say məhsulun növündən asılıdır. Sorğuda istədiyiniz sayı göstərin, uyğun variantı təklif edək.', 'Минимальный тираж зависит от вида продукции. Укажите нужное количество в заявке — предложим подходящий вариант.', 'The minimum depends on the product. Tell us the quantity you need and we’ll suggest the right option.'),
        },
        {
          q: l('Hazır maketim var, birbaşa çap edə bilərsiniz?', 'У меня готовый макет — напечатаете сразу?', 'I have ready artwork — can you print it directly?'),
          a: l('Bəli. Faylı sorğuya əlavə edin; çapdan əvvəl texniki yoxlama aparıb lazım olarsa düzəliş tövsiyə edirik.', 'Да. Прикрепите файл к заявке; перед печатью мы проверим макет и при необходимости посоветуем правки.', 'Yes. Attach the file to your request; we check it before printing and suggest fixes if needed.'),
        },
      ],
      keywords: l('poliqrafiya, poligrafiya, vizitkart, vizitka, vizit kart, flayer, buklet, broşür, kataloq, menyu, stiker, etiket, dəvətnamə, təqvim, kalendar, çap', 'полиграфия, визитки, визитка, флаер, листовка, буклет, брошюра, каталог, меню, стикер, наклейка, этикетка, приглашение, календарь, печать', 'printing, print, business cards, flyer, leaflet, booklet, brochure, catalogue, menu, sticker, label, invitation, calendar, polygraphy'),
    },
    {
      slug: 'large-format-printing',
      icon: 'Maximize',
      quoteFields: ['quantity', 'dimensions', 'material', 'installation'],
      title: l('Geniş formatlı çap', 'Широкоформатная печать', 'Large Format Printing'),
      short: l('Banner, vinil, vitrin və divar qrafikası, tədbir fonları.', 'Баннеры, винил, витринная и настенная графика, фоны для мероприятий.', 'Banners, vinyl, window and wall graphics, event backdrops.'),
      headline: l('Böyük ölçü, aydın mesaj.', 'Большой формат — чёткое сообщение.', 'Big format, clear message.'),
      intro: l(
        'Küçədə, mağazada və tədbirdə diqqət çəkən geniş formatlı çap məhsulları. Sorğuda ölçü, say, istifadə yeri (daxili və ya xarici) və material üstünlüklərini göstərin.',
        'Широкоформатная печать, которая привлекает внимание на улице, в магазине и на мероприятии. Укажите в заявке размеры, количество, место использования (внутри или снаружи) и пожелания по материалу.',
        'Large-format prints that get noticed on the street, in store and at events. Tell us sizes, quantity, where it will be used (indoor or outdoor) and material preferences.',
      ),
      items: [
        ['Banner çapı', 'Печать баннеров', 'Banner printing'],
        ['Vinil çapı', 'Печать на виниле', 'Vinyl printing'],
        ['Yapışqanlı vinil', 'Самоклеящаяся плёнка', 'Adhesive vinyl'],
        ['Vitrin qrafikası', 'Витринная графика', 'Window graphics'],
        ['Divar qrafikası', 'Настенная графика', 'Wall graphics'],
        ['Böyük posterlər', 'Большие постеры', 'Large posters'],
        ['Reklam qrafikası', 'Рекламная графика', 'Advertising graphics'],
        ['Tədbir fonları (press wall)', 'Фоны для мероприятий (пресс-волл)', 'Event backdrops'],
        ['Displey qrafikası', 'Графика для дисплеев', 'Display graphics'],
        ['Açıq hava reklam çapı', 'Печать для наружной рекламы', 'Outdoor advertising prints'],
        ['İnteryer üçün geniş formatlı çap', 'Широкоформатная печать для интерьера', 'Interior large-format prints'],
      ],
      applications: [
        ['Fasad və hasarlar üçün reklam bannerləri', 'Рекламные баннеры для фасадов и ограждений', 'Advertising banners for façades and fences'],
        ['Mağaza vitrininə yapışqanlı qrafika', 'Самоклеящаяся графика для витрины магазина', 'Adhesive graphics for shop windows'],
        ['Ofis divarına brend qrafikası', 'Брендированная графика на стене офиса', 'Brand graphics for an office wall'],
        ['Konfrans üçün press wall və rollap qrafikası', 'Пресс-волл и графика для роллапа на конференцию', 'Press wall and roll-up graphics for a conference'],
      ],
      faq: [
        {
          q: l('Banner xaricdə nə qədər davam edir?', 'Сколько баннер прослужит на улице?', 'How long does an outdoor banner last?'),
          a: l('Bu, material, günəş və hava şəraitindən asılıdır. İstifadə müddətinə görə uyğun materialı konsultasiyada təklif edirik.', 'Это зависит от материала, солнца и погодных условий. Подходящий материал под нужный срок предложим на консультации.', 'It depends on material, sun and weather exposure. We recommend a suitable material for your required lifespan during consultation.'),
        },
        {
          q: l('Quraşdırma da edirsiniz?', 'Вы также монтируете?', 'Do you also install?'),
          a: l('Tələb olunduqda quraşdırmanı ayrıca planlaşdırırıq — sorğuda bunu qeyd edin.', 'При необходимости планируем монтаж отдельно — отметьте это в заявке.', 'Where needed, installation is planned separately — just mention it in your request.'),
        },
      ],
      keywords: l('banner, baner, vinil, vinyl, oracal, plyonka, yapışqanlı, vitrin, divar qrafikası, poster, press wall, presvol, fon, geniş format, iri format', 'баннер, винил, оракал, плёнка, пленка, самоклейка, витрина, настенная графика, постер, пресс-волл, широкоформатная печать', 'banner, vinyl, adhesive vinyl, window graphics, wall graphics, poster, backdrop, press wall, large format, wide format'),
    },
  ],
};
