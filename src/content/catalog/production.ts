import { l, type CategoryDef } from './helpers';

// Note: subservices here are editable/disable-able from the admin dashboard; copy avoids unverified production specs.
export const production: CategoryDef = {
  slug: 'advertising-production',
  icon: 'Factory',
  art: 'production',
  name: l('Reklam İstehsalatı', 'Рекламное производство', 'Advertising Production'),
  tagline: l('İdeya fiziki formaya düşür', 'Идея обретает физическую форму', 'Where ideas take physical form'),
  description: l(
    'CNC, lazer və plotter kəsimi, 3D hərflər, lightbox və lövhələr, açıq hava və interyer reklam konstruksiyaları.',
    'ЧПУ, лазерная и плоттерная резка, объёмные буквы, лайтбоксы и вывески, конструкции наружной и интерьерной рекламы.',
    'CNC, laser and plotter cutting, 3D letters, lightboxes and signs, outdoor and indoor advertising structures.',
  ),
  services: [
    {
      slug: 'cnc-cutting',
      icon: 'Cog',
      quoteFields: ['quantity', 'dimensions', 'material'],
      title: l('CNC kəsim', 'ЧПУ-резка', 'CNC Cutting'),
      short: l('Reklam hərfləri, dekorativ elementlər və lövhə komponentləri.', 'Рекламные буквы, декоративные элементы и компоненты вывесок.', 'Advertising letters, decorative elements and sign components.'),
      headline: l('Dəqiq forma, təkrarlanan keyfiyyət.', 'Точная форма, повторяемое качество.', 'Precise shapes, repeatable quality.'),
      intro: l(
        'CNC əsaslı kəsim reklam hərfləri, lövhə hissələri və dekorativ elementləri rəqəmsal fayl əsasında dəqiq hazırlamağa imkan verir. Material və qalınlıq layihəyə görə konsultasiyada seçilir.',
        'Резка на станке с ЧПУ позволяет точно изготавливать рекламные буквы, детали вывесок и декоративные элементы по цифровому файлу. Материал и толщина подбираются на консультации.',
        'CNC-based cutting produces advertising letters, sign parts and decorative elements precisely from a digital file. Material and thickness are chosen per project during consultation.',
      ),
      items: [
        ['CNC əsaslı fərdi kəsim', 'Индивидуальная резка на ЧПУ', 'CNC-based custom cutting'],
        ['Dekorativ elementlər', 'Декоративные элементы', 'Decorative elements'],
        ['Reklam hərfləri', 'Рекламные буквы', 'Advertising letters'],
        ['Lövhə komponentləri', 'Компоненты вывесок', 'Signage components'],
        ['Fərdi istehsalat komponentləri', 'Индивидуальные производственные детали', 'Custom production components'],
        ['İnteryer reklam elementləri', 'Элементы интерьерной рекламы', 'Interior advertising elements'],
      ],
      applications: [
        ['Fasad lövhəsi üçün həcmli hərflərin hissələri', 'Детали объёмных букв для фасадной вывески', 'Parts for 3D letters on a façade sign'],
        ['Ofis divarı üçün dekorativ loqo', 'Декоративный логотип на стену офиса', 'A decorative logo for an office wall'],
        ['Stend və vitrin üçün dekorativ panellər', 'Декоративные панели для стенда и витрины', 'Decorative panels for stands and windows'],
        ['Seriya şəklində təkrarlanan detallar', 'Серийные повторяющиеся детали', 'Repeating parts produced in series'],
      ],
      faq: [
        {
          q: l('Kəsim üçün hansı fayl lazımdır?', 'Какой файл нужен для резки?', 'What file do you need for cutting?'),
          a: l('Vektor fayl (AI, EPS, SVG, DXF və ya PDF) idealdır. Fayl yoxdursa, dizayn komandamız hazırlaya bilər.', 'Идеален векторный файл (AI, EPS, SVG, DXF или PDF). Если файла нет — его подготовит наша дизайн-команда.', 'A vector file (AI, EPS, SVG, DXF or PDF) is ideal. If you don’t have one, our design team can prepare it.'),
        },
        {
          q: l('Hansı materialları kəsirsiniz?', 'Какие материалы вы режете?', 'Which materials do you cut?'),
          a: l('Material seçimi məhsulun təyinatından asılıdır. Sorğuda istəyinizi yazın, uyğun variantı konsultasiyada təsdiqləyək.', 'Выбор материала зависит от назначения изделия. Напишите пожелания в заявке — подходящий вариант подтвердим на консультации.', 'Material depends on the product’s purpose. Share your preference in the request and we’ll confirm the right option during consultation.'),
        },
      ],
      keywords: l('cnc, çpu, frezer, frez, kəsim, kesim, cnc kesim, hərf kəsimi, dekor', 'чпу, cnc, фрезеровка, фрезер, резка, раскрой', 'cnc, routing, milling, cutting, router'),
    },
    {
      slug: 'laser-cutting',
      icon: 'Zap',
      quoteFields: ['quantity', 'dimensions', 'material'],
      title: l('Lazer kəsim', 'Лазерная резка', 'Laser Cutting'),
      short: l('Dəqiq lazer kəsimi, dekorativ formalar və fərdi yazılar.', 'Точная лазерная резка, декоративные формы и индивидуальные надписи.', 'Precision laser cutting, decorative shapes and custom lettering.'),
      headline: l('İncə detallar üçün lazer dəqiqliyi.', 'Лазерная точность для тонких деталей.', 'Laser precision for fine detail.'),
      intro: l(
        'Lazer kəsim incə konturlu formalar, kiçik hərflər və fərdiləşdirilmiş elementlər üçün uyğundur. Reklam komponentlərindən hədiyyə məhsullarına qədər müxtəlif tətbiqlər üçün istifadə olunur.',
        'Лазерная резка подходит для форм с тонким контуром, мелких букв и персонализированных элементов — от рекламных деталей до подарочной продукции.',
        'Laser cutting suits fine contours, small lettering and personalised elements — from advertising components to gift products.',
      ),
      items: [
        ['Dəqiq lazer kəsimi', 'Точная лазерная резка', 'Precision laser cutting'],
        ['Dekorativ formalar', 'Декоративные формы', 'Decorative shapes'],
        ['Reklam komponentləri', 'Рекламные компоненты', 'Advertising components'],
        ['Fərdi yazılar', 'Индивидуальные надписи', 'Custom lettering'],
        ['Fərdiləşdirilmiş məhsul komponentləri', 'Персонализированные детали изделий', 'Personalized product components'],
      ],
      applications: [
        ['Qəbul masası üçün kiçik ölçülü loqo və yazılar', 'Небольшие логотипы и надписи для ресепшн', 'Small logos and lettering for a reception desk'],
        ['Masaüstü lövhələr və nişanlar', 'Настольные таблички и бейджи', 'Desk plaques and name badges'],
        ['Hədiyyə və promo məhsullar üçün fərdi detallar', 'Индивидуальные детали для подарков и промо', 'Custom parts for gifts and promo items'],
        ['Tədbir dekorasiyası üçün formalar', 'Формы для декора мероприятий', 'Shapes for event decoration'],
      ],
      faq: [
        {
          q: l('Lazer kəsim ilə CNC kəsim arasında fərq nədir?', 'Чем лазерная резка отличается от ЧПУ?', 'What’s the difference between laser and CNC cutting?'),
          a: l('Hər iki üsul fərqli material və detallar üçün uyğundur. Layihənizə hansının daha uyğun olduğunu konsultasiyada tövsiyə edirik.', 'Методы подходят для разных материалов и деталей. Какой лучше для вашего проекта, подскажем на консультации.', 'Each suits different materials and details. We’ll recommend the right one for your project during consultation.'),
        },
        {
          q: l('Tək ədəd sifariş etmək olar?', 'Можно заказать один экземпляр?', 'Can I order a single piece?'),
          a: l('Bəli, fərdi tək məhsullar üçün də sorğu göndərə bilərsiniz.', 'Да, заявку можно отправить и на единичное изделие.', 'Yes, you can request single custom pieces too.'),
        },
      ],
      keywords: l('lazer, lazer kəsim, lazer kesim, lazerlə kəsim, qravüra, gravür, laser', 'лазер, лазерная резка, лазерная гравировка, гравировка', 'laser, laser cutting, laser cut, engraving'),
    },
    {
      slug: 'plotter-cutting',
      icon: 'Scissors',
      quoteFields: ['quantity', 'dimensions', 'material'],
      title: l('Plotter kəsim', 'Плоттерная резка', 'Plotter Cutting'),
      short: l('Vinil və stiker kəsimi, vitrin yazıları, kontur kəsimli qrafika.', 'Резка винила и стикеров, надписи на витринах, контурная графика.', 'Vinyl and sticker cutting, window lettering, contour-cut graphics.'),
      headline: l('Səliqəli kontur, təmiz yazı.', 'Аккуратный контур, чистая надпись.', 'Clean contours, crisp lettering.'),
      intro: l(
        'Plotter kəsimi yapışqanlı vinildən yazı, loqo və dekorativ qrafikanın dəqiq kəsilməsi üçündür. Vitrin, avtomobil və interyer üçün sürətli və effektiv həlldir.',
        'Плоттерная резка — это точная вырезка надписей, логотипов и декоративной графики из самоклеящейся плёнки. Быстрое и эффективное решение для витрин, авто и интерьера.',
        'Plotter cutting precisely cuts lettering, logos and decorative graphics from adhesive vinyl — a fast, effective solution for windows, vehicles and interiors.',
      ),
      items: [
        ['Vinil kəsimi', 'Резка винила', 'Vinyl cutting'],
        ['Stiker kəsimi', 'Резка стикеров', 'Sticker cutting'],
        ['Hərf kəsimi', 'Резка букв', 'Letter cutting'],
        ['Kontur kəsimli qrafika', 'Графика с контурной резкой', 'Contour-cut graphics'],
        ['Vitrin yazıları', 'Надписи на витринах', 'Window lettering'],
        ['Dekorativ yapışqanlı qrafika', 'Декоративная самоклеящаяся графика', 'Decorative adhesive graphics'],
      ],
      applications: [
        ['Vitrində iş saatları və loqo', 'Часы работы и логотип на витрине', 'Opening hours and logo on a shop window'],
        ['Avtomobil üçün yazı və əlaqə məlumatları', 'Надписи и контакты на автомобиль', 'Lettering and contact details for a vehicle'],
        ['Məhsullar üçün kontur kəsimli stikerlər', 'Контурные стикеры для продукции', 'Contour-cut stickers for products'],
        ['Şüşə arakəsmələr üçün dekorativ qrafika', 'Декоративная графика для стеклянных перегородок', 'Decorative graphics for glass partitions'],
      ],
      faq: [
        {
          q: l('Plotter kəsimi ilə çap fərqlidir?', 'Плоттерная резка отличается от печати?', 'Is plotter cutting different from printing?'),
          a: l('Bəli. Plotter rəngli vinildən forma kəsir; çoxrəngli şəkillər üçün isə çap və kontur kəsim birlikdə tətbiq oluna bilər.', 'Да. Плоттер вырезает формы из цветной плёнки, а для многоцветных изображений можно сочетать печать и контурную резку.', 'Yes. A plotter cuts shapes from coloured vinyl; for full-colour images, printing and contour cutting can be combined.'),
        },
        {
          q: l('Yapışdırmanı siz edirsiniz?', 'Вы сами наклеиваете?', 'Do you apply the graphics?'),
          a: l('Tələb olunduqda yapışdırmanı planlaşdıra bilərik — sorğuda qeyd edin.', 'При необходимости можем запланировать поклейку — отметьте в заявке.', 'Where needed, we can arrange application — mention it in your request.'),
        },
      ],
      keywords: l('plotter, plotter kəsim, plotter kesim, vinil kəsim, stiker, nakleyka, yazı, vitrin yazısı, oracal', 'плоттер, плоттерная резка, резка винила, наклейки, стикеры, надписи на витрину, оракал', 'plotter, plotter cutting, vinyl cutting, stickers, decals, window lettering'),
    },
    {
      slug: 'outdoor-advertising',
      icon: 'Signpost',
      quoteFields: ['quantity', 'dimensions', 'material', 'installation'],
      title: l('Açıq hava reklamı', 'Наружная реклама', 'Outdoor Advertising'),
      short: l('Mağaza lövhələri, 3D hərflər, lightbox və fasad reklamı.', 'Вывески, объёмные буквы, лайтбоксы и фасадная реклама.', 'Shop signs, 3D letters, lightboxes and façade signage.'),
      headline: l('Küçədə seçilən brend.', 'Бренд, заметный с улицы.', 'A brand that stands out on the street.'),
      intro: l(
        'Mağaza lövhəsindən fasad konstruksiyasına qədər açıq hava reklamını dizayndan istehsalata və quraşdırmaya qədər planlaşdırırıq. Ölçü, material və işıqlandırma həlli məkana görə konsultasiyada seçilir.',
        'Наружную рекламу — от вывески магазина до фасадной конструкции — планируем от дизайна до производства и монтажа. Размер, материал и подсветка подбираются под место на консультации.',
        'From shop signs to façade structures, we plan outdoor advertising from design through production and installation. Size, material and lighting are chosen for your location during consultation.',
      ),
      items: [
        ['Mağaza lövhələri', 'Вывески для магазинов', 'Shop signs'],
        ['Fasad lövhələri', 'Фасадные вывески', 'Façade signage'],
        ['3D hərflər', 'Объёмные буквы', '3D letters'],
        ['Lightbox reklamı', 'Лайтбоксы', 'Lightbox advertising'],
        ['İşıqlı lövhə konseptləri', 'Концепции световых вывесок', 'Illuminated signage concepts'],
        ['İstiqamət göstəriciləri', 'Указатели', 'Directional signs'],
        ['Açıq hava reklam lövhələri', 'Рекламные щиты', 'Outdoor advertising boards'],
        ['Vitrin qrafikası', 'Витринная графика', 'Storefront graphics'],
        ['Xarici brendinq konstruksiyaları', 'Конструкции наружного брендинга', 'Outdoor branding structures'],
      ],
      applications: [
        ['Yeni mağaza üçün işıqlı 3D hərflər', 'Световые объёмные буквы для нового магазина', 'Illuminated 3D letters for a new shop'],
        ['Kafe üçün lightbox və vitrin qrafikası', 'Лайтбокс и витринная графика для кафе', 'Lightbox and window graphics for a café'],
        ['Biznes mərkəzi üçün istiqamət göstəriciləri', 'Указатели для бизнес-центра', 'Directional signs for a business centre'],
        ['Şəbəkə filialları üçün vahid lövhə standartı', 'Единый стандарт вывесок для сети филиалов', 'Unified sign standard across branches'],
      ],
      faq: [
        {
          q: l('Lövhənin qiyməti nədən asılıdır?', 'От чего зависит стоимость вывески?', 'What does the price of a sign depend on?'),
          a: l('Ölçü, material, işıqlandırma, konstruksiya və quraşdırma şəraitindən. Buna görə hər lövhə üçün fərdi təklif hazırlayırıq.', 'От размера, материала, подсветки, конструкции и условий монтажа. Поэтому для каждой вывески готовим индивидуальный расчёт.', 'Size, material, lighting, structure and installation conditions. That’s why every sign gets an individual quotation.'),
        },
        {
          q: l('Quraşdırmanı da edirsiniz?', 'Монтаж тоже делаете?', 'Do you install the signs?'),
          a: l('Tələb olunduqda quraşdırma planlaşdırılır. Sorğuda ünvanı və quraşdırma ehtiyacını qeyd edin.', 'При необходимости монтаж планируется. Укажите в заявке адрес и потребность в монтаже.', 'Installation is planned where required. Include the address and installation needs in your request.'),
        },
      ],
      keywords: l('açıq hava reklamı, acik hava reklami, lövhə, reklam lövhəsi, vıveska, viveska, 3d hərf, həcmli hərf, lightbox, laytboks, işıqlı reklam, fasad reklamı, bilbord, göstərici', 'наружная реклама, вывеска, объёмные буквы, световые буквы, лайтбокс, световой короб, фасадная реклама, билборд, указатель', 'outdoor advertising, signage, shop sign, 3d letters, channel letters, lightbox, illuminated sign, façade sign, billboard, wayfinding'),
    },
    {
      slug: 'interior-advertising',
      icon: 'Store',
      quoteFields: ['quantity', 'dimensions', 'material', 'installation'],
      title: l('İnteryer reklamı', 'Интерьерная реклама', 'Interior Advertising'),
      short: l('Daxili lövhələr, qəbul zonası, stendlər və POS materialları.', 'Внутренние вывески, ресепшн, стенды и POS-материалы.', 'Indoor signs, reception branding, stands and POS displays.'),
      headline: l('Brend məkanın içində də danışır.', 'Бренд говорит и внутри помещения.', 'Your brand, speaking indoors.'),
      intro: l(
        'Ofis, mağaza və sərgi məkanlarında brendi və naviqasiyanı aydın edən interyer reklam həlləri: qəbul zonası brendinqindən satış nöqtəsi displeylərinə qədər.',
        'Решения интерьерной рекламы, которые делают бренд и навигацию понятными в офисах, магазинах и на выставках: от брендирования ресепшн до POS-дисплеев.',
        'Indoor advertising that makes your brand and wayfinding clear in offices, shops and exhibitions — from reception branding to point-of-sale displays.',
      ),
      items: [
        ['Daxili lövhələr', 'Внутренние вывески', 'Indoor signs'],
        ['Qəbul zonası brendinqi', 'Брендирование ресепшн', 'Reception branding'],
        ['Divar brendinqi', 'Брендирование стен', 'Wall branding'],
        ['Məlumat lövhələri', 'Информационные стенды', 'Information boards'],
        ['Reklam stendləri', 'Рекламные стенды', 'Advertising stands'],
        ['Sərgi stendləri', 'Выставочные стенды', 'Exhibition stands'],
        ['Satış nöqtəsi displeyləri (POS)', 'POS-дисплеи', 'Point-of-sale displays'],
        ['İstiqamət göstəriciləri', 'Навигационные указатели', 'Directional signage'],
        ['Daxili promo displeylər', 'Внутренние промо-дисплеи', 'Indoor promotional displays'],
        ['Ofis brendinqi', 'Брендирование офиса', 'Office branding'],
        ['Pərakəndə reklam həlləri', 'Решения для розничной рекламы', 'Retail advertising solutions'],
      ],
      applications: [
        ['Ofis qəbul zonası üçün həcmli loqo', 'Объёмный логотип для ресепшн офиса', '3D logo for an office reception'],
        ['Mağazada məhsul üçün POS displey', 'POS-дисплей для товара в магазине', 'POS display for a product in store'],
        ['Sərgi üçün brendlənmiş stend', 'Брендированный стенд для выставки', 'Branded stand for an exhibition'],
        ['Mərtəbələr üzrə naviqasiya lövhələri', 'Навигационные таблички по этажам', 'Floor-by-floor wayfinding signs'],
      ],
      faq: [
        {
          q: l('Sərgi stendini tam hazırlaya bilərsiniz?', 'Можете ли вы изготовить выставочный стенд под ключ?', 'Can you produce a complete exhibition stand?'),
          a: l('Stend konsepti, 3D vizualizasiya, qrafika və reklam elementlərini bir yerdə planlaşdırırıq. Həcm və tələbləri konsultasiyada dəqiqləşdiririk.', 'Планируем концепцию стенда, 3D-визуализацию, графику и рекламные элементы в одном месте. Объём и требования уточняем на консультации.', 'We plan the stand concept, 3D visualisation, graphics and advertising elements together. Scope and requirements are clarified during consultation.'),
        },
        {
          q: l('Mövcud interyerə uyğunlaşdırırsınız?', 'Учитываете ли вы существующий интерьер?', 'Do you adapt to an existing interior?'),
          a: l('Bəli. Məkanın foto və ölçülərini göndərin, reklam elementlərini mövcud interyerə uyğun təklif edək.', 'Да. Пришлите фото и размеры помещения — предложим элементы, вписанные в интерьер.', 'Yes. Send photos and dimensions and we’ll propose elements that fit your existing interior.'),
        },
      ],
      keywords: l('interyer reklamı, daxili reklam, stend, sərgi stendi, pos, displey, qəbul zonası, resepşn, ofis brendinqi, lövhə, tablo, naviqasiya', 'интерьерная реклама, внутренняя реклама, стенд, выставочный стенд, pos, дисплей, ресепшн, брендирование офиса, таблички, навигация', 'indoor advertising, interior signage, stand, exhibition stand, pos, display, reception, office branding, wayfinding'),
    },
  ],
};
