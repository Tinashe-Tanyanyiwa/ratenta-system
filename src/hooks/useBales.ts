import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { balesApi, DirectusBale } from '@/lib/directus';

export function useBales(boxId?: string) {
  return useQuery({
    queryKey: ['bales', boxId], // Use boxId in the query key for caching
    queryFn: () => balesApi.getAll(boxId), // Pass boxId to the API
    staleTime: 30000,
  });
}


export function useBale(id: string | undefined) {
  return useQuery({
    queryKey: ['bales', id],
    queryFn: () => (id ? balesApi.getById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}


export function useBaleByBarcode(barcode: string | undefined) {
  return useQuery({
    queryKey: ['bales', 'barcode', barcode],
    queryFn: () => (barcode ? balesApi.getByBarcode(barcode) : null),
    enabled: !!barcode,
    staleTime: 30000,
  });
}

export function useCreateBale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<DirectusBale>) => balesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bales'] });
    },
  });
}

export function useUpdateBale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DirectusBale> }) => 
      balesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['bales'] });
      queryClient.invalidateQueries({ queryKey: ['bales', id] });
    },
  });
}

export function useDeleteBale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => balesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bales'] });
    },
  });
}
