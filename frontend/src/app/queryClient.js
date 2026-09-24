import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 secondes au lieu de 60
      retry: 1,
      refetchOnWindowFocus: true, // Activer le rafraîchissement automatique
      refetchOnMount: true, // Toujours rafraîchir au montage du composant
    },
  },
});
