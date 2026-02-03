import { Github } from 'lucide-react';
import { useNameStore } from '../stores/useNameStore';
import { GlitchText } from './ui/GlitchText';

const authorName = 'Wilson Faustino';

export const Footer = () => {
  const currentTheme = useNameStore((state) => state.currentTheme);
  const isMatrixTheme = currentTheme === 'matrix';

  return (
    <footer className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-4 text-center font-mono text-text/40 text-xs sm:text-sm space-y-1">
      <div>
        Created with ❤️ by{' '}
        <a
          href="https://github.com/wilsonfaustino"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-(--color-accent) transition-colors"
        >
          {isMatrixTheme ? <GlitchText>{authorName}</GlitchText> : authorName}
        </a>
      </div>

      <div className="flex items-center justify-center gap-1">
        Project on{' '}
        <a
          href="https://github.com/wilsonfaustino/solar-wheel-of-fortune"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-(--color-accent) transition-colors"
        >
          <Github className="size-3 sm:size-4" />
          Github
        </a>
      </div>
    </footer>
  );
};
