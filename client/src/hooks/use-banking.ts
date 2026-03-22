import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type TransactionResponse } from "@shared/routes";
import { toCents } from "@/lib/utils";

// Helper to handle API fetch
async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "An error occurred");
  }
  return res.json();
}

export function useBalance() {
  return useQuery({
    queryKey: [api.balances.get.path],
    queryFn: () => fetchApi(api.balances.get.path),
  });
}

export function useTransactions() {
  return useQuery<TransactionResponse[]>({
    queryKey: [api.transactions.list.path],
    queryFn: () => fetchApi(api.transactions.list.path),
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ dollars, externalApp, upiId }: { dollars: number, externalApp?: string, upiId?: string }) => {
      return fetchApi(api.transactions.deposit.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: toCents(dollars),
          externalApp,
          upiId
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.balances.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ dollars, upiId }: { dollars: number; upiId: string }) => {
      return fetchApi(api.transactions.withdraw.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: toCents(dollars), upiId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.balances.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}

export function useTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ dollars, toUserId, description }: { dollars: number, toUserId: string, description?: string }) => {
      return fetchApi(api.transactions.transfer.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: toCents(dollars), 
          toUserId, 
          description 
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.balances.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}
