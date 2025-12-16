import { Toaster as SonnerToaster } from 'sonner';
import { useMediaQuery } from '../../hooks';

export function Toaster() {
  const { isSmallScreen } = useMediaQuery();
  return (
    <SonnerToaster
      position="bottom-center"
      expand={true}
      richColors={false}
      closeButton={false}
      duration={5000}
      visibleToasts={3}
      gap={8}
      offset={isSmallScreen ? 100 : 150}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'toast-container',
          title: 'toast-title',
          description: 'toast-description',
          closeButton: 'toast-close',
        },
      }}
    />
  );
}
