import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { baleShipmentsApi, DirectusBaleShipment } from "@/lib/directus";


export function useBaleShipments() {
  return useQuery({
    queryKey: ['bale_shipment'],
    queryFn: () => baleShipmentsApi.getAll(),
    staleTime: 30000,
  });
}

export function useBaleShipment(id: string | undefined) {
  return useQuery({
    queryKey: ['bale_shipment', id],
    queryFn: () => (id ? baleShipmentsApi.getById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateBaleShipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<DirectusBaleShipment>) => baleShipmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bale_shipment'] });
    },
  });
}

export function useUpdateBaleShipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DirectusBaleShipment> }) => 
        baleShipmentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['bale_shipment'] });
      queryClient.invalidateQueries({ queryKey: ['bale_shipment', id] });
    },
  });
}

export function useDeleteBaleShipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => baleShipmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bale_shipment'] });
    },
  });
}
