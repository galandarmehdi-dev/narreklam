import { createContext, useContext } from 'react';

/** Admin interface labels (az default, en, ru). */
const az = {
  title: 'NarReklam Admin',
  login: 'Daxil ol', email: 'E-poçt', password: 'Şifrə', forgot: 'Şifrəni unutmusunuz?', sendReset: 'Bərpa linki göndər',
  resetSent: 'Şifrə bərpası linki e-poçtunuza göndərildi (hesab mövcuddursa).', newPassword: 'Yeni şifrə', setPassword: 'Şifrəni təyin et',
  passwordSet: 'Şifrə yeniləndi.', loginError: 'E-poçt və ya şifrə yanlışdır.', logout: 'Çıxış', backToLogin: 'Girişə qayıt',
  denied: 'Bu hesabın admin panelə giriş icazəsi yoxdur.', deniedHint: 'Administrator hesabınıza "editor" və ya "admin" rolu verməlidir.',
  notConfigured: 'Supabase qoşulmayıb', notConfiguredText: 'Admin panel üçün .env faylında VITE_SUPABASE_URL və VITE_SUPABASE_ANON_KEY dəyərlərini təyin edin və saytı yenidən yığın. Ətraflı: README.md.',
  overview: 'İcmal', quotes: 'Sorğular', services: 'Xidmətlər', categories: 'Kateqoriyalar', portfolio: 'Portfolio', content: 'Sayt mətnləri',
  faq: 'Suallar (FAQ)', instagram: 'Instagram', settings: 'Şirkət ayarları', viewSite: 'Sayta bax', account: 'Hesab', changePassword: 'Şifrəni dəyiş',
  save: 'Yadda saxla', saving: 'Saxlanılır…', saved: 'Yadda saxlanıldı', cancel: 'Ləğv et', delete: 'Sil', add: 'Əlavə et', edit: 'Redaktə',
  confirmDelete: 'Silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.', create: 'Yarat', back: 'Geri', search: 'Axtar…', all: 'Hamısı',
  published: 'Dərc olunub', draft: 'Qaralama', featured: 'Seçilmiş', publish: 'Dərc et', unpublish: 'Gizlət', moveUp: 'Yuxarı', moveDown: 'Aşağı',
  error: 'Xəta', loading: 'Yüklənir…', empty: 'Hələ heç nə yoxdur.', slug: 'URL (slug)', slugHint: 'Yalnız kiçik latın hərfləri, rəqəm və tire.',
  icon: 'İkon', image: 'Şəkil', upload: 'Yüklə', replace: 'Dəyiş', remove: 'Sil', order: 'Sıra', category: 'Kateqoriya', status: 'Status',
  name: 'Ad', title_: 'Başlıq', tagline: 'Qısa şüar', description: 'Təsvir', short: 'Qısa təsvir', headline: 'Əsas başlıq', intro: 'Giriş mətni',
  keywords: 'Açar sözlər / sinonimlər (vergüllə)', seoTitle: 'SEO başlıq', seoDescription: 'SEO təsvir', applications: 'Tətbiq nümunələri (hər sətir bir nümunə)',
  items: 'Alt xidmətlər', addItem: 'Alt xidmət əlavə et', quoteFields: 'Sorğu formasında əlavə sahələr', faqTitle: 'Suallar', question: 'Sual', answer: 'Cavab',
  addQuestion: 'Sual əlavə et', art: 'Şəkil olmadıqda illüstrasiya', newService: 'Yeni xidmət', newCategory: 'Yeni kateqoriya', newProject: 'Yeni layihə',
  client: 'Müştəri (istəyə bağlı)', date: 'Tarix (istəyə bağlı)', location: 'Məkan (istəyə bağlı)', scope: 'İşin həcmi', materials: 'Materiallar',
  summary: 'Qısa təsvir', servicesUsed: 'İstifadə olunan xidmətlər', images: 'Şəkillər', cover: 'Üz qabığı', setCover: 'Üz qabığı et', alt: 'Alt mətn',
  caption: 'Şəkil izahı', focalHint: 'Kəsim mərkəzini təyin etmək üçün şəklin üzərinə klikləyin.', saveFirst: 'Şəkil yükləmək üçün əvvəlcə layihəni yadda saxlayın.',
  demo: 'Demo (ictimai saytda görünmür)', total: 'Ümumi sorğular', newInquiries: 'Yeni sorğular', projectsPublished: 'Dərc olunmuş layihələr',
  projectsDraft: 'Qaralama layihələr', servicesPublished: 'Aktiv xidmətlər', messages: 'Əlaqə mesajları', recent: 'Son sorğular', integrations: 'İnteqrasiyalar',
  emailOk: 'E-poçt bildirişləri qoşulub.', emailMissing: 'E-poçt bildirişləri qoşulmayıb — yeni sorğular yalnız bu paneldə görünəcək. RESEND_API_KEY və QUOTE_NOTIFY_EMAIL sirlərini təyin edin.',
  fnMissing: 'quote-submit Edge Function əlçatan deyil — sorğular qəbul edilmir. README-dəki addımlara baxın.',
  notifFailed: 'Bildiriş göndərilməyən sorğular', reference: 'Nömrə', customer: 'Müştəri', service: 'Xidmət', received: 'Daxil olub', kind: 'Növ',
  quote: 'Qiymət sorğusu', contactMsg: 'Əlaqə mesajı', phone: 'Telefon', whatsapp: 'WhatsApp', company: 'Şirkət', deadline: 'Müddət', contactMethod: 'Əlaqə üsulu',
  details: 'Detallar', attachments: 'Fayllar', download: 'Yüklə', preview: 'Bax', notes: 'Daxili qeydlər', addNote: 'Qeyd əlavə et', notePh: 'Yalnız komanda görür…',
  notification: 'Bildiriş', source: 'Mənbə səhifə', language: 'Dil', rejected: 'rədd edildi', pending: 'yüklənməyib',
  st_new: 'Yeni', st_contacted: 'Əlaqə saxlanılıb', st_quoted: 'Təklif göndərilib', st_in_progress: 'İcrada', st_completed: 'Tamamlanıb', st_closed: 'Bağlanıb',
  overrideHint: 'Boş saxlanılan sahə standart mətni istifadə edir (yer tutucuda göstərilir).', companyName: 'Şirkət adı', logo: 'Loqo',
  logoHint: 'PNG/WebP, şəffaf fon tövsiyə olunur. Yüklənənə qədər müvəqqəti yazı loqosu göstərilir.', phone2: 'Əlavə telefon', address: 'Ünvan',
  hours: 'İş saatları', mapEmbed: 'Google Maps embed URL', mapLink: 'Xəritə linki', social: 'Sosial şəbəkələr', postUrl: 'Instagram post linki',
  imageUrl: 'Şəkil', staleNote: 'Dəyişikliklər saytda dərhal görünür. Axtarış sistemləri üçün statik səhifələr növbəti deploy zamanı yenilənir.',
  page: 'Səhifə', prev: 'Əvvəlki', next: 'Növbəti', open: 'Aç', copyRef: 'Kopyala', placeholderWarn: 'Əlaqə məlumatları hələ daxil edilməyib — saytda "tezliklə" kimi göstərilir.',
};

export type AdminDict = typeof az;

const en: AdminDict = {
  ...az,
  login: 'Sign in', email: 'Email', password: 'Password', forgot: 'Forgot password?', sendReset: 'Send reset link',
  resetSent: 'If the account exists, a reset link has been sent.', newPassword: 'New password', setPassword: 'Set password', passwordSet: 'Password updated.',
  loginError: 'Incorrect email or password.', logout: 'Sign out', backToLogin: 'Back to sign in', denied: 'This account is not authorised for the admin dashboard.',
  deniedHint: 'An administrator must grant your account the "editor" or "admin" role.', notConfigured: 'Supabase not connected',
  notConfiguredText: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env and rebuild. See README.md.',
  overview: 'Overview', quotes: 'Requests', services: 'Services', categories: 'Categories', portfolio: 'Portfolio', content: 'Website content', faq: 'FAQ',
  settings: 'Company settings', viewSite: 'View site', account: 'Account', changePassword: 'Change password', save: 'Save', saving: 'Saving…', saved: 'Saved',
  cancel: 'Cancel', delete: 'Delete', add: 'Add', edit: 'Edit', confirmDelete: 'Are you sure? This cannot be undone.', create: 'Create', back: 'Back',
  search: 'Search…', all: 'All', published: 'Published', draft: 'Draft', featured: 'Featured', publish: 'Publish', unpublish: 'Hide', moveUp: 'Move up',
  moveDown: 'Move down', error: 'Error', loading: 'Loading…', empty: 'Nothing here yet.', slugHint: 'Lowercase latin letters, digits and hyphens only.',
  icon: 'Icon', image: 'Image', upload: 'Upload', replace: 'Replace', remove: 'Remove', order: 'Order', category: 'Category', status: 'Status', name: 'Name',
  title_: 'Title', tagline: 'Tagline', description: 'Description', short: 'Short description', headline: 'Headline', intro: 'Intro text',
  keywords: 'Keywords / synonyms (comma-separated)', seoTitle: 'SEO title', seoDescription: 'SEO description', applications: 'Application examples (one per line)',
  items: 'Sub-services', addItem: 'Add sub-service', quoteFields: 'Extra quote form fields', faqTitle: 'Questions', question: 'Question', answer: 'Answer',
  addQuestion: 'Add question', art: 'Illustration when no image', newService: 'New service', newCategory: 'New category', newProject: 'New project',
  client: 'Client (optional)', date: 'Date (optional)', location: 'Location (optional)', scope: 'Project scope', materials: 'Materials', summary: 'Summary',
  servicesUsed: 'Services used', images: 'Images', cover: 'Cover', setCover: 'Set as cover', alt: 'Alt text', caption: 'Caption',
  focalHint: 'Click the image to set the crop focus point.', saveFirst: 'Save the project first to upload images.', demo: 'Demo (never shown publicly)',
  total: 'Total requests', newInquiries: 'New inquiries', projectsPublished: 'Published projects', projectsDraft: 'Draft projects',
  servicesPublished: 'Active services', messages: 'Contact messages', recent: 'Recent requests', integrations: 'Integrations',
  emailOk: 'Email notifications are configured.', emailMissing: 'Email notifications are NOT configured — new requests only appear in this dashboard. Set RESEND_API_KEY and QUOTE_NOTIFY_EMAIL secrets.',
  fnMissing: 'The quote-submit Edge Function is unreachable — requests cannot be received. See the README.', notifFailed: 'Requests whose notification failed',
  reference: 'Ref', customer: 'Customer', service: 'Service', received: 'Received', kind: 'Type', quote: 'Quotation', contactMsg: 'Contact message',
  phone: 'Phone', company: 'Company', deadline: 'Deadline', contactMethod: 'Contact method', details: 'Details', attachments: 'Attachments', download: 'Download',
  preview: 'Preview', notes: 'Internal notes', addNote: 'Add note', notePh: 'Visible to the team only…', notification: 'Notification', source: 'Source page',
  language: 'Language', rejected: 'rejected', pending: 'not uploaded', st_new: 'New', st_contacted: 'Contacted', st_quoted: 'Quoted', st_in_progress: 'In progress',
  st_completed: 'Completed', st_closed: 'Closed', overrideHint: 'Leave empty to use the default text (shown as placeholder).', companyName: 'Company name', logo: 'Logo',
  logoHint: 'PNG/WebP with transparent background recommended. The temporary wordmark is shown until a logo is uploaded.', phone2: 'Secondary phone',
  address: 'Address', hours: 'Working hours', mapEmbed: 'Google Maps embed URL', mapLink: 'Map link', social: 'Social media', postUrl: 'Instagram post URL',
  imageUrl: 'Image', staleNote: 'Changes appear on the live site immediately. Static search-engine snapshots refresh on the next deploy.', page: 'Page',
  prev: 'Previous', next: 'Next', open: 'Open', copyRef: 'Copy', placeholderWarn: 'Contact details have not been entered yet — the site shows "coming soon".',
};

const ru: AdminDict = {
  ...en,
  login: 'Войти', password: 'Пароль', forgot: 'Забыли пароль?', logout: 'Выйти', overview: 'Обзор', quotes: 'Заявки', services: 'Услуги',
  categories: 'Категории', portfolio: 'Портфолио', content: 'Тексты сайта', settings: 'Настройки компании', viewSite: 'Открыть сайт', save: 'Сохранить',
  saving: 'Сохранение…', saved: 'Сохранено', cancel: 'Отмена', delete: 'Удалить', add: 'Добавить', edit: 'Изменить', back: 'Назад', search: 'Поиск…',
  all: 'Все', published: 'Опубликовано', draft: 'Черновик', featured: 'Избранное', loading: 'Загрузка…', images: 'Фото', notes: 'Внутренние заметки',
  attachments: 'Файлы', download: 'Скачать', status: 'Статус', st_new: 'Новая', st_contacted: 'Связались', st_quoted: 'Расчёт отправлен',
  st_in_progress: 'В работе', st_completed: 'Завершена', st_closed: 'Закрыта', total: 'Всего заявок', newInquiries: 'Новые заявки',
};

export const ADMIN_DICTS = { az, en, ru };
export type AdminLang = keyof typeof ADMIN_DICTS;
export const AdminI18nCtx = createContext<AdminDict>(az);
export const useA = () => useContext(AdminI18nCtx);
