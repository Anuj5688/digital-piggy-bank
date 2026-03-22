import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export function useUsersSearch(search: string) {
  return useQuery<User[]>({
    queryKey: [api.users.list.path, search],
    queryFn: async () => {
      const url = new URL(api.users.list.path, window.location.origin);
      if (search) url.searchParams.append("search", search);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    // Only search if there are at least 2 characters to avoid too many requests
    enabled: search.length >= 2,
    staleTime: 60000,
  });
}
