/* eslint-disable @next/next/no-img-element -- картинки из ImageKit с готовой трансформацией */
import { mediaUrl } from '@/lib/strapi';
import type { StrapiMedia } from '@/types/strapi';

/**
 * Сетка фотографий страниц-деталей (макет «Общежитие — деталь»): первое фото
 * крупное на две строки, остальные — плитками. Заменяет старую UIkit-галерею
 * с лайтбоксом: в редизайне фото просто выложены сеткой.
 */
export default function PhotoGrid({
  images,
  alt = '',
}: {
  images: Array<StrapiMedia | null | undefined>;
  alt?: string;
}) {
  const list = images.filter(Boolean).slice(0, 5) as StrapiMedia[];
  if (!list.length) return null;

  return (
    <div className="grid auto-rows-[130px] grid-cols-2 gap-3.5 md:auto-rows-[180px] md:grid-cols-4">
      {list.map((image, index) => {
        // кадрирование не трогаем — только ширину; высоту атрибута считаем по
        // пропорциям оригинала, чтобы браузер знал размер до загрузки
        const width = index === 0 ? 900 : 480;
        const height =
          image.width && image.height ? Math.round((width * image.height) / image.width) : undefined;

        return (
          <div
            key={image.id}
            className={`rounded-card relative overflow-hidden ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
          >
            {/* первое фото — первый экран страницы, остальные догружаются лениво */}
            <img
              src={mediaUrl(image, { width }) ?? ''}
              alt={alt}
              width={width}
              height={height}
              className="h-full w-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
