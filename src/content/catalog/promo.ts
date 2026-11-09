import { l, type CategoryDef } from './helpers';

export const promo: CategoryDef = {
  slug: 'branding-promo',
  icon: 'Gift',
  art: 'promo',
  name: l('Brendinq və Promo Məhsullar', 'Брендинг и промо-продукция', 'Branding & Promotional Products'),
  tagline: l('Brendiniz hər yerdə yanınızda', 'Ваш бренд всегда рядом', 'Your brand, everywhere you go'),
  description: l(
    'Brendlənmiş hədiyyələr, korporativ geyim, DTF və flex çap, avtomobil və park brendinqi.',
    'Брендированные подарки, корпоративная одежда, DTF и flex-печать, брендирование автомобилей и автопарков.',
    'Branded gifts, corporate apparel, DTF and flex printing, vehicle and fleet branding.',
  ),
  services: [
    {
      slug: 'promotional-merchandise',
      icon: 'Gift',
      quoteFields: ['quantity'],
      title: l('Promo məhsullar', 'Промо-продукция', 'Promotional Merchandise'),
      short: l('Brendlənmiş qələm, dəftər, korporativ hədiyyələr və setlər.', 'Брендированные ручки, блокноты, корпоративные подарки и наборы.', 'Branded pens, notebooks, corporate gifts and sets.'),
      headline: l('Yadda qalan hədiyyələr, tanınan brend.', 'Запоминающиеся подарки, узнаваемый бренд.', 'Memorable gifts, recognisable brand.'),
      intro: l(
        'Tədbirlər, müştərilər və komanda üçün brendlənmiş məhsullar. Büdcə, say və mövzuya uyğun məhsul seçimini birlikdə edir, loqonun tətbiqini dizayndan çapa qədər planlaşdırırıq.',
        'Брендированная продукция для мероприятий, клиентов и команды. Вместе подбираем изделия под бюджет, тираж и тему и планируем нанесение логотипа от дизайна до печати.',
        'Branded products for events, clients and teams. We choose items to fit your budget, quantity and theme, and plan logo application from design to print.',
      ),
      items: [
        ['Brendlənmiş qələmlər', 'Брендированные ручки', 'Branded pens'],
        ['Brendlənmiş dəftərlər', 'Брендированные блокноты', 'Branded notebooks'],
        ['Promo dəftərxana', 'Промо-канцелярия', 'Promotional stationery'],
        ['Korporativ hədiyyələr', 'Корпоративные подарки', 'Corporate gift items'],
        ['Fərdi promo məhsullar', 'Индивидуальная промо-продукция', 'Custom promotional products'],
        ['Fərdiləşdirilmiş aksesuarlar', 'Персонализированные аксессуары', 'Personalized accessories'],
        ['Promo məhsul setləri', 'Промо-наборы', 'Promotional product sets'],
        ['Tədbir hədiyyələri', 'Подарки для мероприятий', 'Event giveaway items'],
      ],
      applications: [
        ['Yeni əməkdaşlar üçün welcome-pack', 'Welcome-pack для новых сотрудников', 'Welcome packs for new employees'],
        ['Konfrans iştirakçıları üçün qələm və dəftər', 'Ручки и блокноты для участников конференции', 'Pens and notebooks for conference attendees'],
        ['Bayram üçün korporativ hədiyyə setləri', 'Праздничные корпоративные подарочные наборы', 'Holiday corporate gift sets'],
        ['Sərgi stendində paylanan promo məhsullar', 'Промо-продукция для раздачи на выставке', 'Giveaways for an exhibition stand'],
      ],
      faq: [
        {
          q: l('Hansı məhsullar seçmək olar?', 'Какие изделия можно выбрать?', 'Which products can I choose?'),
          a: l('Seçim büdcə və saydan asılıdır. Sorğuda məqsədi və təxmini sayı yazın, uyğun variantlar təklif edək.', 'Выбор зависит от бюджета и тиража. Опишите цель и примерное количество — предложим варианты.', 'It depends on budget and quantity. Describe the purpose and approximate number and we’ll suggest options.'),
        },
        {
          q: l('Loqo dizaynını da edirsiniz?', 'Вы делаете и дизайн нанесения?', 'Do you prepare the logo artwork?'),
          a: l('Bəli, loqonun məhsul üzərində düzgün yerləşdirilməsi üçün maket hazırlayırıq.', 'Да, готовим макет, чтобы логотип правильно разместился на изделии.', 'Yes, we prepare artwork so the logo sits correctly on each product.'),
        },
      ],
      keywords: l('promo, promo məhsul, suvenir, hədiyyə, korporativ hədiyyə, brendli qələm, dəftər, bloknot, merch, merç, giveaway', 'промо, сувениры, сувенирная продукция, подарки, корпоративные подарки, ручки с логотипом, блокноты, мерч', 'promo, merchandise, merch, swag, gifts, corporate gifts, branded pens, notebooks, giveaways, souvenirs'),
    },
    {
      slug: 'clothing-branding',
      icon: 'Shirt',
      quoteFields: ['garmentType', 'quantity', 'printPlacement', 'sizes'],
      title: l('Geyim brendinqi', 'Брендирование одежды', 'Clothing Branding'),
      short: l('DTF və flex çap, korporativ forma, T-shirt və hudilər.', 'DTF и flex-печать, корпоративная форма, футболки и худи.', 'DTF and flex printing, uniforms, T-shirts and hoodies.'),
      headline: l('Komandanız brendinizin daşıyıcısıdır.', 'Ваша команда — носитель бренда.', 'Your team carries your brand.'),
      intro: l(
        'Korporativ forma, iş geyimi və tədbir geyimləri üzərində loqo və qrafikaların tətbiqi. Sorğuda geyim növünü, sayı, çap yerini və ölçü bölgüsünü göstərin.',
        'Нанесение логотипов и графики на корпоративную форму, спецодежду и одежду для мероприятий. Укажите в заявке тип одежды, количество, место нанесения и размерную сетку.',
        'Applying logos and graphics to uniforms, workwear and event apparel. Include garment type, quantity, print placement and size breakdown in your request.',
      ),
      items: [
        ['DTF çap', 'DTF-печать', 'DTF printing'],
        ['Flex çap', 'Flex-печать', 'Flex printing'],
        ['Korporativ forma', 'Корпоративная форма', 'Corporate uniforms'],
        ['Brendlənmiş T-shirtlər', 'Брендированные футболки', 'Branded T-shirts'],
        ['Brendlənmiş hudilər', 'Брендированные худи', 'Branded hoodies'],
        ['İş geyimi brendinqi', 'Брендирование спецодежды', 'Workwear branding'],
        ['Personal geyimi', 'Одежда для персонала', 'Staff clothing'],
        ['Tədbir geyimləri', 'Одежда для мероприятий', 'Event apparel'],
        ['Tekstil üzərində loqo tətbiqi', 'Нанесение логотипа на текстиль', 'Textile logo applications'],
      ],
      applications: [
        ['Kafe və restoran personalı üçün forma', 'Форма для персонала кафе и ресторана', 'Uniforms for café and restaurant staff'],
        ['Marafon və ya festival üçün T-shirtlər', 'Футболки для марафона или фестиваля', 'T-shirts for a marathon or festival'],
        ['Tikinti şirkəti üçün iş geyimi brendinqi', 'Брендирование спецодежды строительной компании', 'Workwear branding for a construction company'],
        ['Komanda üçün brendlənmiş hudilər', 'Брендированные худи для команды', 'Branded hoodies for a team'],
      ],
      faq: [
        {
          q: l('DTF və flex çap arasında fərq nədir?', 'Чем DTF отличается от flex-печати?', 'What’s the difference between DTF and flex printing?'),
          a: l('DTF çoxrəngli və detallı təsvirlər üçün, flex isə sadə formalı, az rəngli loqo və yazılar üçün daha uyğundur. Layihənizə uyğun üsulu tövsiyə edirik.', 'DTF лучше подходит для многоцветных и детализированных изображений, flex — для простых логотипов и надписей в один-два цвета. Подскажем подходящий метод.', 'DTF suits multi-colour, detailed images; flex suits simple logos and lettering in few colours. We’ll recommend the right method.'),
        },
        {
          q: l('Geyimi siz təmin edirsiniz, yoxsa mən gətirməliyəm?', 'Одежду предоставляете вы или мне привезти свою?', 'Do you supply garments or should I bring my own?'),
          a: l('Hər iki variant mümkündür — sorğuda qeyd edin, birlikdə ən uyğununu seçək.', 'Возможны оба варианта — отметьте в заявке, выберем лучший вместе.', 'Both are possible — mention it in your request and we’ll choose together.'),
        },
      ],
      keywords: l('dtf, dtf çap, flex, fleks, forma, korporativ forma, futbolka, tişört, t-shirt, hudi, hoodie, iş geyimi, geyim çapı, tekstil', 'dtf, dtf печать, флекс, flex, форма, корпоративная форма, футболки, худи, спецодежда, печать на одежде, текстиль', 'dtf, dtf printing, flex, heat transfer, uniforms, t-shirts, hoodies, workwear, apparel printing, textile'),
    },
    {
      slug: 'vehicle-branding',
      icon: 'Car',
      quoteFields: ['vehicleType', 'coverage', 'quantity'],
      title: l('Avtomobil brendinqi', 'Брендирование автомобилей', 'Vehicle Branding'),
      short: l('Avtomobil qrafikası, yazılar, qismən və tam üzləmə konseptləri.', 'Графика на авто, надписи, частичная и полная оклейка.', 'Vehicle graphics, lettering, partial and full wrap concepts.'),
      headline: l('Hər gün şəhərdə hərəkət edən reklam.', 'Реклама, которая каждый день ездит по городу.', 'Advertising that moves through the city every day.'),
      intro: l(
        'Şirkət avtomobilləri və nəqliyyat parkı üçün yazı, loqo və qrafik dizayn. Sorğuda nəqliyyat növünü və təxmini örtük dərəcəsini göstərin — dizaynı avtomobilin formasına uyğun hazırlayırıq.',
        'Надписи, логотипы и графика для служебных автомобилей и автопарков. Укажите в заявке тип транспорта и примерную площадь оклейки — подготовим дизайн с учётом формы авто.',
        'Lettering, logos and graphics for company vehicles and fleets. Tell us the vehicle type and approximate coverage — we design around the shape of the vehicle.',
      ),
      items: [
        ['Avtomobil brendinqi', 'Брендирование автомобиля', 'Car branding'],
        ['Avtomobil qrafikası', 'Графика на автомобиль', 'Vehicle graphics'],
        ['Kommersiya nəqliyyatı üçün yazılar', 'Надписи на коммерческий транспорт', 'Commercial vehicle lettering'],
        ['Qismən üzləmə', 'Частичная оклейка', 'Partial vehicle wraps'],
        ['Tam brendinq konseptləri', 'Концепции полного брендирования', 'Full vehicle branding concepts'],
        ['Nəqliyyat parkı brendinqi', 'Брендирование автопарка', 'Fleet branding'],
        ['Promo avtomobil qrafikası', 'Промо-графика на автомобиль', 'Promotional vehicle graphics'],
      ],
      applications: [
        ['Çatdırılma furqonları üçün vahid dizayn', 'Единый дизайн для фургонов доставки', 'Unified design for delivery vans'],
        ['Xidmət avtomobilində loqo və əlaqə məlumatları', 'Логотип и контакты на служебном авто', 'Logo and contact details on a service car'],
        ['Kampaniya dövrü üçün promo qrafika', 'Промо-графика на период кампании', 'Promotional graphics for a campaign period'],
        ['Taksi və ya kuryer parkı brendinqi', 'Брендирование таксопарка или курьерского автопарка', 'Branding for a taxi or courier fleet'],
      ],
      faq: [
        {
          q: l('Qrafika avtomobilin boyasına zərər verirmi?', 'Не повредит ли графика лакокрасочное покрытие?', 'Will the graphics damage the paint?'),
          a: l('Material seçimi və düzgün tətbiq vacibdir. Avtomobilin vəziyyətini və istifadə müddətini nəzərə alaraq uyğun həlli konsultasiyada müzakirə edirik.', 'Важны выбор материала и правильное нанесение. Подходящее решение с учётом состояния авто и срока использования обсуждаем на консультации.', 'Material choice and correct application matter. We discuss the right solution for your vehicle’s condition and intended duration during consultation.'),
        },
        {
          q: l('Bir neçə avtomobil üçün eyni dizayn olarmı?', 'Можно ли один дизайн для нескольких авто?', 'Can several vehicles share one design?'),
          a: l('Bəli, park üçün dizaynı müxtəlif modellərə uyğunlaşdıra bilərik.', 'Да, адаптируем дизайн под разные модели автопарка.', 'Yes, we can adapt one design across different fleet models.'),
        },
      ],
      keywords: l('avtomobil brendinqi, avtomobil üzləmə, avto üzləmə, maşın üzləmə, maşın reklamı, avto reklam, vinil, park brendinqi, furqon', 'брендирование авто, оклейка авто, оклейка автомобиля, реклама на авто, брендирование автопарка, наклейки на авто', 'vehicle branding, car wrap, vehicle wrap, car graphics, fleet branding, van lettering, car advertising'),
    },
  ],
};
