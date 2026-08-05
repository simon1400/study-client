/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import { mediaUrl } from '@/lib/strapi';
import type { StrapiMedia } from '@/types/strapi';

/**
 * Галерея под шапкой деталки (университет, проживание): видно 4 превью,
 * остальные скрыты, но участвуют в лайтбоксе UIkit. Поверх четвёртого —
 * ссылка «все фотографии».
 */
export default function Gallery({ images }: { images: StrapiMedia[] }) {
  if (!images?.length) return null;

  return (
    <div className="top-galery-wrap">
      <div
        className="uk-grid uk-grid-collapse uk-flex-center uk-child-width-1-2 uk-child-width-1-4@s"
        uk-grid=""
        uk-lightbox="animation: scale"
      >
        {images.map((image, index) => {
          const isLastVisible = index === 3 || (index <= 3 && images.length === index + 1);
          return (
            <div key={image.id} className={index > 3 ? 'uk-hidden' : ''}>
              <div className="uk-position-relative galery-item-wrap">
                <a
                  href={mediaUrl(image) ?? ''}
                  className="galery-item uk-cover-container uk-inline uk-width-1-1"
                >
                  <img src={mediaUrl(image, { height: 120 }) ?? ''} alt="" uk-cover="" />
                </a>
                {isLastVisible ? (
                  <a
                    href={mediaUrl(images[0]) ?? ''}
                    className="uk-position-cover uk-overlay uk-overlay-default uk-flex uk-flex-center uk-flex-middle uk-text-center uk-flex-column"
                  >
                    <img src="/camera-regular.svg" className="camera" alt="" />
                    все фотографии
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
