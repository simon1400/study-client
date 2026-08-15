'use client';

/* eslint-disable @next/next/no-img-element -- статика из public/ */
import { useState } from 'react';

export default function MapSection() {
  const [showMap, setShowMap] = useState(false);
  // iframe Google Maps тянет ~600КБ скриптов — не монтируем его, пока блок ни разу
  // не открыли, иначе карта грузится на каждом визите главной при свёрнутом блоке
  const [mounted, setMounted] = useState(false);

  return (
    <section className="map">
      <button
        className="button-map"
        onClick={() => {
          setShowMap(!showMap);
          setMounted(true);
        }}
      >
        НАШ ОФИС В ЦЕНТРЕ БРНО <img src="/angle-down-light.svg" alt="Down" />
      </button>
      <div className={`map-wrap ${showMap ? 'show-map' : ''}`}>
        {mounted && (
          <iframe
            title="Mapa"
            src="https://www.google.com/maps/d/u/0/embed?mid=1yY8eiTQPebST_CY0i1KFJ4Vq_YXEq4Vg"
            width="100%"
            height="100%"
          />
        )}
      </div>
    </section>
  );
}
