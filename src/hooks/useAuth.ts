import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export type AuthUser = {
  id: number;
  username: string;
  name: string | null;
  role: string;
  status: string;
  location?: string | null;
};

export function useAuth() {
  const utils = trpc.useUtils();

  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  // `isAuthLoading` is true only while the very first `auth.me` is in flight.
  // Background refetches (isFetching) should not flip the UI to a loading state.
  const isAuthLoading = isLoading;

  return useMemo(
    () => ({
      user: (user ?? null) as AuthUser | null,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isLoading: isAuthLoading || logoutMutation.isPending,
      isAuthLoading,
      logout,
    }),
    [user, isAuthLoading, logoutMutation.isPending, logout]
  );
}
