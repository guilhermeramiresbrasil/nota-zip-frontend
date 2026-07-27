'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type LazySectionProps = {
  children: ReactNode;
  rootMargin?: string;
};

export function LazySection({ children, rootMargin = '200px 0px 200px 0px' }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{visible ? children : null}</div>;
}
