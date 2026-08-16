/**
 * Типы контента Strapi v5 — зеркало схем из study-strapi (src/api/…/schema.json
 * и src/components). Плоский формат ответа v5, без обёртки attributes.
 */

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: { page: number; pageSize: number; pageCount: number; total: number };
  };
}

export interface StrapiEntity {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  url: string;
  formats: Record<string, { url: string; width: number; height: number }> | null;
}

/* --- компоненты --- */

export interface ContactDetails {
  email: string | null;
  phone: string | null;
}

export interface SocLinks {
  facebook: string | null;
  instagram: string | null;
  vkontakte: string | null;
}

export interface MenuLink {
  id: number;
  title: string;
  url: string;
}

export interface TextItem {
  id: number;
  text: string;
}

export interface Parametr {
  id: number;
  title: string;
  name: string;
}

export interface Period {
  from: string | null;
  to: string | null;
}

export interface Faculty {
  id: number;
  title: string;
  specializations: TextItem[];
}

export interface Person {
  id: number;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  image: StrapiMedia | null;
}

export interface ContactInfoItem {
  id: number;
  type: string;
  value: string;
}

export interface HomeStep {
  id: number;
  title: string;
  content: string;
}

export interface HomeService {
  id: number;
  title: string;
  content: string;
  url: string | null;
  /** Цена в карточке программы на главной (редизайн). */
  price: string | null;
  /** Выделенная карточка — сплошной Primary Blue, цена жёлтым (стайлгайд §05). */
  featured: boolean | null;
  image: StrapiMedia | null;
}

/** Цифра под первым экраном: 15+ лет опыта. */
export interface HomeStat {
  id: number;
  value: string;
  label: string;
}

/** Плашка поверх фото первого экрана. */
export interface HomeHighlight {
  id: number;
  title: string;
  text: string | null;
  style: 'light' | 'yellow' | 'ink';
}

export interface HomeContactInfo {
  title: string;
  content: string;
  append: string | null;
}

/* --- типы контента --- */

export interface Global extends StrapiEntity {
  title: string;
  description: string | null;
  contacts: ContactDetails | null;
  socLinks: SocLinks | null;
}

export type MenuLocation = 'menu_top' | 'menu_footer_1' | 'menu_footer_2' | 'menu_footer_3' | 'sidebar';

export interface Menu extends StrapiEntity {
  title: string | null;
  location: MenuLocation;
  items: MenuLink[];
}

export interface Homepage extends StrapiEntity {
  title: string;
  description: string | null;
  heroBadge: string | null;
  heroStats: HomeStat[];
  heroHighlights: HomeHighlight[];
  homepageSteps: HomeStep[];
  ourServices: HomeService[];
  contactInfo: HomeContactInfo | null;
}

/** Отзыв студента или родителя — секция «Наши студенты уже в Чехии». */
export interface Review extends StrapiEntity {
  text: string;
  name: string;
  role: string | null;
  photo: StrapiMedia | null;
  rating: number | null;
  order: number | null;
}

/** Плитка «Медиатеки» на главной (замена мёртвой ленты Instagram API v1). */
export interface MediaItem extends StrapiEntity {
  image: StrapiMedia | null;
  caption: string | null;
  kind: 'photo' | 'video';
  url: string | null;
  tall: boolean | null;
  order: number | null;
}

export interface City extends StrapiEntity {
  title: string;
}

export interface Article extends StrapiEntity {
  title: string;
  slug: string;
  order: number | null;
  shortContent: string | null;
  content: string | null;
  image: StrapiMedia | null;
  showOnBlog: boolean | null;
}

export interface University extends StrapiEntity {
  title: string;
  slug: string;
  order: number | null;
  shortContent: string | null;
  content: string | null;
  image: StrapiMedia | null;
  galery: StrapiMedia[];
  facultyTitle: string | null;
  facultyImage: StrapiMedia | null;
  faculties: Faculty[];
  city: City | null;
}

export interface Program extends StrapiEntity {
  title: string;
  slug: string;
  order: number | null;
  price: string | null;
  period: Period | null;
  shortContent: string | null;
  content: string | null;
  include: Parametr[];
  includeBefore: TextItem[];
  includeAfter: TextItem[];
  includeAdditional: TextItem[];
  notInclude: TextItem[];
  options: unknown;
  city: City | null;
}

export interface Living extends StrapiEntity {
  title: string;
  slug: string;
  order: number | null;
  price: string | null;
  shortContent: string | null;
  content: string | null;
  benefits: TextItem[];
  detailedPrices: TextItem[];
  image: StrapiMedia | null;
  galery: StrapiMedia[];
  city: City | null;
}

export interface Partner extends StrapiEntity {
  title: string;
  url: string | null;
  order: number | null;
  content: string | null;
  image: StrapiMedia | null;
}

export interface Branch extends StrapiEntity {
  title: string;
  order: number | null;
  flag: StrapiMedia | null;
  contactInformations: ContactInfoItem[];
}

export interface FaqItem extends StrapiEntity {
  question: string;
  answer: string | null;
  order: number | null;
}

export interface Service extends StrapiEntity {
  title: string;
  description: string | null;
  order: number | null;
}

/**
 * Техническая страница из коллекции `page`: защита персональных данных, оферта,
 * условия и всё, что редактор заведёт позже. Адрес — `/<slug>`, вёрстка общая.
 */
export interface InfoPage extends StrapiEntity {
  title: string;
  slug: string;
  eyebrow: string | null;
  lead: string | null;
  content: string | null;
  attachmentTitle: string | null;
  attachmentSubtitle: string | null;
  attachmentFile: StrapiMedia | null;
  note: string | null;
  showInFooter: boolean | null;
  order: number | null;
}

export interface ContactsPage extends StrapiEntity {
  address: string | null;
  email: string | null;
  phone: string | null;
  skype: string | null;
  peoples: Person[];
}
