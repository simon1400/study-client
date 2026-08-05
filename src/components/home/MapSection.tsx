'use client';

/* eslint-disable @next/next/no-img-element -- статика из public/ */
import { useState } from 'react';

export default function MapSection() {
  const [showMap, setShowMap] = useState(false);

  return (
    <section className="map">
      <button className="button-map" onClick={() => setShowMap(!showMap)}>
        НАШ ОФИС В ЦЕНТРЕ БРНО <img src="/angle-down-light.svg" alt="Down" />
      </button>
      <div className={`map-wrap ${showMap ? 'show-map' : ''}`}>
        <iframe
          title="Mapa"
          src="https://www.google.com/maps/d/u/0/embed?mid=1yY8eiTQPebST_CY0i1KFJ4Vq_YXEq4Vg"
          width="100%"
          height="100%"
        />
      </div>
    </section>
  );
}
