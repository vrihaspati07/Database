import React from 'react';

export const LogoStrip: React.FC = () => {
  const stacks = [
    { name: 'Next.js', tag: 'React 19' },
    { name: 'Flutter', tag: 'Cross-Platform' },
    { name: 'Python FastAPI', tag: 'Async Core' },
    { name: 'Node.js', tag: 'TypeScript' },
    { name: 'Go', tag: 'High QPS' },
    { name: 'React Native', tag: 'Mobile' },
    { name: 'Kotlin', tag: 'Android SDK' },
    { name: 'Swift', tag: 'iOS SDK' },
    { name: 'Docker', tag: 'Self-Host' },
    { name: 'Prisma & Drizzle', tag: 'Postgres ORM' }
  ];

  return (
    <div className="py-14 border-y border-[#E5E5E5] bg-[#F5F5F7] overflow-hidden">
      <div className="w-[88%] lg:w-[83%] max-w-[1280px] mx-auto mb-6">
        <p className="text-center text-[12px] font-mono tracking-[2px] uppercase text-[#6b6b6b] font-medium">
          NATIVE CLIENT LIBRARIES & ZERO-CONFIG INTEGRATIONS
        </p>
      </div>

      {/* Infinite Horizontal Carousel Strip */}
      <div className="relative w-full overflow-hidden">
        {/* Left & Right gradient fades for smooth carousel edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F5F5F7] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F5F5F7] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center gap-6">
          {[...stacks, ...stacks].map((stack, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-[#E5E5E5] text-[#4a4a4a] hover:border-orange-500/50 hover:text-[#1a1a1a] transition-all duration-300 shadow-sm cursor-default shrink-0"
            >
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm font-semibold font-sans">{stack.name}</span>
              <span className="text-[11px] font-mono text-[#6b6b6b]">
                • {stack.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
