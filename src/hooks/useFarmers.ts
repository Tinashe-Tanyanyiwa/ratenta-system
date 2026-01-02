import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmersApi, DirectusFarmer } from '@/lib/directus';

export function useFarmers() {
  return useQuery({
    queryKey: ['farmers'],
    queryFn: () => farmersApi.getAll(),
    staleTime: 30000,
  });
}

export function useFarmer(id: string | undefined) {
  return useQuery({
    queryKey: ['farmers', id],
    queryFn: () => (id ? farmersApi.getById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateFarmer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<DirectusFarmer>) => farmersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
    },
  });
}

export function useUpdateFarmer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DirectusFarmer> }) => 
      farmersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['farmers', id] });
    },
  });
}

export function useDeleteFarmer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => farmersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
    },
  });
}
