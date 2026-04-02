import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequestJson, queryClient } from "@/lib/queryClient";
import type { TebexCategory, TebexPackage, TebexBasket } from "@data/schema";

export function useCategories() {
  return useQuery<TebexCategory[]>({
    queryKey: ["/api/store/categories"],
  });
}

export function useCategoriesWithPackages() {
  return useQuery<TebexCategory[]>({
    queryKey: ["/api/store/categories?includePackages=true"],
  });
}

export function usePackages() {
  return useQuery<TebexPackage[]>({
    queryKey: ["/api/store/packages"],
  });
}

export function useFeaturedPackages() {
  return useQuery<TebexPackage[]>({
    queryKey: ["/api/store/featured"],
  });
}

export function usePackage(id: number) {
  return useQuery<TebexPackage>({
    queryKey: ["/api/store/packages", id],
    enabled: !!id,
  });
}

export function useBasket() {
  return useQuery<TebexBasket | null>({
    queryKey: ["/api/basket"],
  });
}

export function useCreateBasket() {
  return useMutation({
    mutationFn: async (data: { username: string }) => {
      return await apiRequestJson<TebexBasket>("POST", "/api/basket", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/basket"] });
    },
  });
}

export function useAddToBasket() {
  return useMutation({
    mutationFn: async (data: { packageId: number; quantity?: number }) => {
      return await apiRequestJson<TebexBasket>("POST", "/api/basket/add", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/basket"] });
    },
  });
}
