import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boxesApi, DirectusBox } from '@/lib/directus';

export function useBoxes() {
  return useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxesApi.getAll(),
    staleTime: 30000,
  });
}

export function useBox(id: string | undefined) {
  return useQuery({
    queryKey: ['boxes', id],
    queryFn: () => (id ? boxesApi.getById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateBox() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<DirectusBox>) => boxesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boxes'] });
    },
  });
}

export function useUpdateBox() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DirectusBox> }) => 
      boxesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['boxes'] });
      queryClient.invalidateQueries({ queryKey: ['boxes', id] });
    },
  });
}

export function useDeleteBox() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => boxesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boxes'] });
    },
  });
}
