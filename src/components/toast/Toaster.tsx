import { Toaster as SonnerToaster } from 'sonner';
import { useMediaQuery } from '../../hooks';

export function Toaster() {
  const { isSmallScreen } = useMediaQuery();
  return (
    <SonnerToaster
      position="bottom-center"
      expand={false}
      richColors={true}
      closeButton={false}
      duration={25000}
      visibleToasts={3}
      gap={14}
      offset={isSmallScreen ? 100 : 150}
      toastOptions={{
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
