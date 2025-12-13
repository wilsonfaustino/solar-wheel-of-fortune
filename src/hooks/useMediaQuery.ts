import { useEffect, useState } from 'react';

interface MediaQueryResult {
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
}

export function useMediaQuery(): MediaQueryResult {
  const [mediaQuery, setMediaQuery] = useState<MediaQueryResult>({
    isSmallScreen: false,
    isMediumScreen: false,
    isLargeScreen: true,
  });

  useEffect(() => {
    const smallQuery = window.matchMedia('(max-width: 639px)');
    const mediumQuery = window.matchMedia('(min-width: 640px) and (max-width: 1023px)');
    const largeQuery = window.matchMedia('(min-width: 1024px)');

    const updateQueries = () => {
      setMediaQuery({
        isSmallScreen: smallQuery.matches,
        isMediumScreen: mediumQuery.matches,
        isLargeScreen: largeQuery.matches,
      });
    };

    updateQueries();

    smallQuery.addEventListener('change', updateQueries);
    mediumQuery.addEventListener('change', updateQueries);
    largeQuery.addEventListener('change', updateQueries);

    return () => {
      smallQuery.removeEventListener('change', updateQueries);
      mediumQuery.removeEventListener('change', updateQueries);
      largeQuery.removeEventListener('change', updateQueries);
    };
  }, []);

  return mediaQuery;
}
