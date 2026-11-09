import { l, type CategoryDef } from './helpers';

// Note: paid media buying, video production, SEO consulting and influencer management are NOT claimed.
export const digital: CategoryDef = {
  slug: 'digital-advertising',
  icon: 'Megaphone',
  art: 'digital',
  name: l('Rəqəmsal Reklam', 'Цифровая реклама', 'Digital Advertising'),
  tagline: l('Brendiniz lentdə də seçilsin', 'Пусть бренд выделяется и в ленте', 'Stand out in the feed, too'),
  description: l(
    'Sosial media idarəçiliyi, kontent planı, kreativ kampaniyalar və rəqəmsal reklam vizualları.',
    'Ведение соцсетей, контент-план, креативные кампании и визуалы для цифровой рекламы.',
    'Social media management, content planning, creative campaigns and digital advertising visuals.',
  ),
  services: [
    {
      slug: 'social-media-marketing',
      icon: 'Megaphone',
      quoteFields: [],
      title: l('Sosial media marketinqi (SMM)', 'SMM — продвижение в соцсетях', 'Social Media Marketing'),
      short: l('Sosial media idarəçiliyi, dizayn, kontent planı və kampaniyalar.', 'Ведение соцсетей, дизайн, контент-план и кампании.', 'Social media management, design, content planning and campaigns.'),
      headline: l('Ardıcıl, tanınan və canlı sosial media.', 'Последовательные, узнаваемые и живые соцсети.', 'Consistent, recognisable, lively social media.'),
      intro: l(
        'Brendinizin sosial mediada vahid vizual dildə və planlı şəkildə danışmasına kömək edirik: kontent planı, post və story dizaynı, kreativ kampaniyalar və reklam vizualları.',
        'Помогаем бренду говорить в соцсетях единым визуальным языком и по плану: контент-план, дизайн постов и сторис, креативные кампании и рекламные визуалы.',
        'We help your brand speak on social media with one visual language and a clear plan: content planning, post and story design, creative campaigns and ad visuals.',
      ),
      items: [
        ['Sosial media idarəçiliyi', 'Ведение социальных сетей', 'Social media management'],
        ['Sosial media dizaynı', 'Дизайн для соцсетей', 'Social media design'],
        ['Kontent planlaşdırması', 'Контент-планирование', 'Content planning'],
        ['Kontent təqviminin hazırlanması', 'Составление контент-календаря', 'Content calendar creation'],
        ['Kreativ sosial kampaniyalar', 'Креативные кампании в соцсетях', 'Creative social campaigns'],
        ['Sosial media reklam kreativləri', 'Рекламные креативы для соцсетей', 'Social media advertising creatives'],
        ['Brend kommunikasiyası', 'Бренд-коммуникация', 'Brand communication'],
        ['Rəqəmsal promo vizuallar', 'Цифровые промо-визуалы', 'Digital promotional visuals'],
      ],
      applications: [
        ['Instagram səhifəsi üçün aylıq kontent planı və dizayn', 'Ежемесячный контент-план и дизайн для Instagram', 'Monthly content plan and design for Instagram'],
        ['Açılış və ya endirim kampaniyası üçün vizual seriya', 'Серия визуалов для открытия или акции', 'A visual series for a launch or sale campaign'],
        ['Brend üçün vahid post və story şablonları', 'Единые шаблоны постов и сторис для бренда', 'Unified post and story templates for a brand'],
        ['Reklam kampaniyaları üçün kreativ bannerlər', 'Креативные баннеры для рекламных кампаний', 'Creative banners for ad campaigns'],
      ],
      faq: [
        {
          q: l('Ödənişli reklamın idarə olunması daxildirmi?', 'Входит ли ведение платной рекламы?', 'Is paid ad management included?'),
          a: l('Xidmət kontent, dizayn və reklam kreativlərinin hazırlanmasını əhatə edir. Ödənişli reklam kampaniyalarının idarə olunması ehtiyacını ayrıca müzakirə edirik.', 'Услуга охватывает контент, дизайн и рекламные креативы. Потребность в ведении платных кампаний обсуждаем отдельно.', 'The service covers content, design and ad creatives. Managing paid campaigns is discussed separately.'),
        },
        {
          q: l('Hansı platformalarla işləyirsiniz?', 'С какими платформами вы работаете?', 'Which platforms do you work with?'),
          a: l('Əsasən Instagram və Facebook. Digər platformalar üçün ehtiyacınızı sorğuda qeyd edin.', 'В основном Instagram и Facebook. Для других платформ укажите потребность в заявке.', 'Mainly Instagram and Facebook. Let us know in your request if you need other platforms.'),
        },
      ],
      keywords: l('smm, sosial media, instagram, facebook, kontent, kontent plan, post dizaynı, story, reklam kreativi, tiktok', 'smm, смм, соцсети, инстаграм, instagram, контент, контент-план, дизайн постов, сторис, креативы', 'smm, social media, instagram, facebook, content, content plan, post design, stories, ad creatives'),
    },
  ],
};
