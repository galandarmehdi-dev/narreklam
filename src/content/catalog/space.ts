import { l, type CategoryDef } from './helpers';

// Note: copy deliberately avoids implying architectural licences, engineering certification or construction permits.
export const space: CategoryDef = {
  slug: 'interior-exterior-planning',
  icon: 'Ruler',
  art: 'space',
  name: l('İnteryer, Eksteryer və Layihələndirmə', 'Интерьер, экстерьер и проектирование', 'Interior, Exterior & Planning'),
  tagline: l('Məkanınız brendinizi danışsın', 'Пусть пространство говорит о бренде', 'Let your space speak for your brand'),
  description: l(
    'Kommersiya interyerləri, fasad və vitrin konseptləri, reklam konstruksiyalarının planlaşdırılması və istehsalat çertyojları.',
    'Концепции коммерческих интерьеров, фасадов и витрин, планирование рекламных конструкций и производственные чертежи.',
    'Commercial interior, façade and shopfront concepts, advertising structure planning and production drawings.',
  ),
  services: [
    {
      slug: 'interior-design',
      icon: 'Sofa',
      quoteFields: ['dimensions'],
      title: l('İnteryer dizaynı', 'Дизайн интерьера', 'Interior Design'),
      short: l('Ofis, mağaza və şourumlar üçün brendlənmiş interyer konseptləri.', 'Брендированные концепции интерьеров офисов, магазинов и шоурумов.', 'Branded interior concepts for offices, shops and showrooms.'),
      headline: l('Brendinizin içəridən hiss olunduğu məkanlar.', 'Пространства, где бренд ощущается изнутри.', 'Spaces where your brand is felt from the inside.'),
      intro: l(
        'Kommersiya məkanlarını brendin xarakterinə uyğun planlaşdırırıq: rəng, material, işıq və reklam elementlərinin yerləşdirilməsi. Konsept 3D vizualizasiya ilə təqdim olunur.',
        'Планируем коммерческие пространства в характере бренда: цвет, материалы, свет и размещение рекламных элементов. Концепция представляется в 3D-визуализации.',
        'We plan commercial spaces around your brand: colour, materials, light and placement of advertising elements. Concepts are presented with 3D visualisation.',
      ),
      items: [
        ['Kommersiya interyer konseptləri', 'Концепции коммерческих интерьеров', 'Commercial interior concepts'],
        ['Ofis interyer dizaynı', 'Дизайн офисного интерьера', 'Office interior design'],
        ['Pərakəndə satış məkanı konseptləri', 'Концепции торговых пространств', 'Retail space concepts'],
        ['Şourum dizaynı', 'Дизайн шоурума', 'Showroom design'],
        ['Brendlənmiş interyer mühitləri', 'Брендированные интерьерные пространства', 'Branded interior environments'],
        ['İnteryerdə reklamın yerləşdirilməsi', 'Размещение рекламы в интерьере', 'Interior advertising placement'],
        ['İnteryer 3D vizualizasiyası', '3D-визуализация интерьера', 'Interior 3D visualization'],
      ],
      applications: [
        ['Ofisin qəbul zonası və divar brendinqi', 'Ресепшн и брендирование стен офиса', 'Office reception and wall branding'],
        ['Mağazada məhsul və reklam zonalarının planı', 'План товарных и рекламных зон магазина', 'Product and advertising zones in a shop'],
        ['Avtomobil və ya mebel şourumu konsepti', 'Концепция автосалона или мебельного шоурума', 'Car or furniture showroom concept'],
        ['Kafe interyerində brend elementləri', 'Элементы бренда в интерьере кафе', 'Brand elements in a café interior'],
      ],
      faq: [
        {
          q: l('Təmir işlərini də görürsünüz?', 'Вы выполняете ремонтные работы?', 'Do you carry out renovation work?'),
          a: l('Xidmətimiz interyer konsepti, vizualizasiya və reklam elementlərinin hazırlanmasını əhatə edir. Tikinti-təmir işləri ayrıca razılaşdırılır.', 'Услуга охватывает концепцию интерьера, визуализацию и изготовление рекламных элементов. Строительно-ремонтные работы обсуждаются отдельно.', 'The service covers the interior concept, visualisation and producing advertising elements. Construction work is agreed separately.'),
        },
        {
          q: l('Kiçik məkanlar üçün də işləyirsiniz?', 'Работаете ли вы с небольшими помещениями?', 'Do you work on small spaces?'),
          a: l('Bəli, kiçik ofis və ya butik üçün də konsept hazırlaya bilərik.', 'Да, можем подготовить концепцию и для небольшого офиса или бутика.', 'Yes, we can prepare concepts for small offices or boutiques too.'),
        },
      ],
      keywords: l('interyer, interier, ofis dizaynı, mağaza dizaynı, şourum, interyer dizayn', 'интерьер, дизайн офиса, дизайн магазина, шоурум', 'interior, interior design, office design, retail design, showroom'),
    },
    {
      slug: 'exterior-design',
      icon: 'Building2',
      quoteFields: ['dimensions'],
      title: l('Eksteryer dizaynı', 'Дизайн экстерьера', 'Exterior Design'),
      short: l('Fasad, vitrin və giriş konseptləri, xarici brendinq.', 'Концепции фасадов, витрин и входных групп, наружный брендинг.', 'Façade, shopfront and entrance concepts, external branding.'),
      headline: l('İlk təəssürat küçədən başlayır.', 'Первое впечатление начинается с улицы.', 'First impressions start on the street.'),
      intro: l(
        'Fasad, vitrin və giriş hissəsini brendin vizual sisteminə uyğun planlaşdırırıq ki, məkanınız uzaqdan seçilsin. Konseptlər 3D vizualizasiya ilə təqdim olunur və istehsalata hazır şəkildə detallaşdırılır.',
        'Планируем фасад, витрину и входную группу в соответствии с визуальной системой бренда, чтобы место было заметно издалека. Концепции показываем в 3D и детализируем для производства.',
        'We plan façades, shopfronts and entrances in line with your brand system so your location stands out from afar. Concepts are shown in 3D and detailed for production.',
      ),
      items: [
        ['Kommersiya fasad konseptləri', 'Концепции коммерческих фасадов', 'Commercial façade concepts'],
        ['Vitrin dizaynı', 'Дизайн витрины', 'Shopfront design'],
        ['Giriş hissəsi konseptləri', 'Концепции входной группы', 'Entrance design concepts'],
        ['Xarici brendinq konseptləri', 'Концепции наружного брендинга', 'External branding concepts'],
        ['Eksteryer 3D vizualizasiyası', '3D-визуализация экстерьера', 'Exterior 3D visualization'],
      ],
      applications: [
        ['Yeni mağazanın fasad və lövhə konsepti', 'Концепция фасада и вывески нового магазина', 'Façade and sign concept for a new shop'],
        ['Restoranın giriş hissəsi və vitrin qrafikası', 'Входная группа и витринная графика ресторана', 'Restaurant entrance and window graphics'],
        ['Şəbəkə filialları üçün vahid fasad standartı', 'Единый стандарт фасадов для сети филиалов', 'A unified façade standard for a branch network'],
        ['Biznes mərkəzinin xarici naviqasiya konsepti', 'Концепция наружной навигации бизнес-центра', 'External wayfinding concept for a business centre'],
      ],
      faq: [
        {
          q: l('Fasad reklamı üçün icazə məsələlərini həll edirsiniz?', 'Решаете ли вы вопросы разрешений на фасадную рекламу?', 'Do you handle permits for façade advertising?'),
          a: l('İcazə tələbləri məkana görə fərqlənir. Konsultasiya zamanı hansı sənədlərin lazım ola biləcəyini müzakirə edirik; rəsmi icazələrin alınması müştəri ilə ayrıca razılaşdırılır.', 'Требования к разрешениям зависят от места. На консультации обсуждаем, какие документы могут понадобиться; получение разрешений согласовывается с клиентом отдельно.', 'Permit requirements vary by location. We discuss which documents may be needed during consultation; obtaining official permits is agreed separately with the client.'),
        },
        {
          q: l('Konsepti sonra istehsal edə bilərsiniz?', 'Можете ли вы затем изготовить по концепции?', 'Can you produce the concept afterwards?'),
          a: l('Bəli, lövhə, 3D hərf və vitrin qrafikası kimi elementləri istehsalat bölməmizdə hazırlayırıq.', 'Да, вывески, объёмные буквы и витринную графику изготавливаем в нашем производстве.', 'Yes, signs, 3D letters and window graphics are made by our production team.'),
        },
      ],
      keywords: l('eksteryer, fasad, vitrin, giriş, fasad dizaynı, fasad reklamı', 'экстерьер, фасад, витрина, входная группа, дизайн фасада', 'exterior, façade, facade, shopfront, storefront, entrance'),
    },
    {
      slug: 'project-planning',
      icon: 'Ruler',
      quoteFields: ['dimensions', 'installation'],
      title: l('Layihələndirmə', 'Проектирование', 'Project Planning'),
      short: l('Reklam konstruksiyalarının planı, texniki və istehsalat çertyojları.', 'Планирование рекламных конструкций, технические и производственные чертежи.', 'Advertising structure planning, technical and production drawings.'),
      headline: l('Dəqiq plan — problemsiz istehsalat.', 'Точный план — производство без сюрпризов.', 'Precise planning, smooth production.'),
      intro: l(
        'Reklam məhsulu istehsalata getməzdən əvvəl ölçüləri, materialları və quraşdırma ardıcıllığını planlaşdırırıq. Texniki və istehsalat çertyojları ideyanın dəqiq və təkrar oluna bilən şəkildə hazırlanmasına kömək edir.',
        'Прежде чем рекламное изделие уйдёт в производство, мы планируем размеры, материалы и порядок монтажа. Технические и производственные чертежи помогают изготовить идею точно и воспроизводимо.',
        'Before an advertising product goes into production, we plan dimensions, materials and installation sequence. Technical and production drawings make the idea precise and repeatable.',
      ),
      items: [
        ['Reklam konstruksiyalarının planlaşdırılması', 'Планирование рекламных конструкций', 'Advertising structure planning'],
        ['Texniki çertyojlar', 'Технические чертежи', 'Technical drawings'],
        ['İstehsalat çertyojları', 'Производственные чертежи', 'Production drawings'],
        ['Lövhələrin planlaşdırılması', 'Планирование вывесок', 'Signage planning'],
        ['Ölçülü planlar', 'Размерные схемы', 'Dimensional layouts'],
        ['Quraşdırmanın planlaşdırılması', 'Планирование монтажа', 'Installation planning'],
        ['Fərdi reklam məhsulu konseptləri', 'Концепции индивидуальных рекламных изделий', 'Custom advertising product concepts'],
      ],
      applications: [
        ['Fasad lövhəsinin ölçülü sxemi', 'Размерная схема фасадной вывески', 'Dimensional layout of a façade sign'],
        ['Biznes mərkəzi üçün naviqasiya lövhələri planı', 'План навигационных табличек для бизнес-центра', 'Wayfinding sign plan for a business centre'],
        ['CNC və lazer kəsim üçün istehsalat faylları', 'Производственные файлы для ЧПУ и лазерной резки', 'Production files for CNC and laser cutting'],
        ['Sərgi stendinin montaj ardıcıllığı', 'Порядок монтажа выставочного стенда', 'Installation sequence for an exhibition stand'],
      ],
      faq: [
        {
          q: l('Bu memarlıq və ya mühəndislik layihəsidir?', 'Это архитектурное или инженерное проектирование?', 'Is this architectural or engineering design?'),
          a: l('Xeyr. Xidmət reklam məhsullarının və konstruksiyalarının istehsalat və quraşdırma planlamasını əhatə edir. Lisenziya tələb edən memarlıq və mühəndislik layihələri bu xidmətə daxil deyil.', 'Нет. Услуга охватывает планирование производства и монтажа рекламных изделий и конструкций. Лицензируемое архитектурное и инженерное проектирование в неё не входит.', 'No. The service covers production and installation planning for advertising products and structures. Licensed architectural or engineering design is not included.'),
        },
        {
          q: l('Ölçünü kim götürür?', 'Кто снимает замеры?', 'Who takes the measurements?'),
          a: l('Məkan ölçülərini siz göndərə bilərsiniz və ya ölçü götürülməsini konsultasiya zamanı razılaşdıra bilərik.', 'Вы можете прислать размеры сами, либо мы договоримся о замере на консультации.', 'You can send the dimensions yourself, or we can arrange measuring during consultation.'),
        },
      ],
      keywords: l('layihə, çertyoj, texniki çertyoj, ölçü, sxem, planlaşdırma, montaj planı', 'проект, чертёж, чертеж, технический чертёж, замер, схема, планирование монтажа', 'planning, technical drawing, production drawing, measurements, layout, installation plan'),
    },
  ],
};
