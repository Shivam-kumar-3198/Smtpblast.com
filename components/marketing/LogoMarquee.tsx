"use client";

import Image from "next/image";

interface ClientLogo {
  name: string;
  src: string;
  href?: string;
}

export function LogoMarquee({ logos }: { logos: ClientLogo[] }) {
  const track = [...logos, ...logos];

  return (
    <div
      className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      tabIndex={0}
    >
      <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-16 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
        {track.map((logo, i) => (
          <div key={`${logo.name}-${i}`} className="flex h-8 shrink-0 items-center grayscale">
            <Image
              src={logo.src}
              alt={logo.name}
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
