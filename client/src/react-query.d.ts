declare module '@tanstack/react-query' {
    export function useQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData, TQueryKey = unknown>(options: any): {
        data: TData | undefined;
        isLoading: boolean;
        isPending: boolean; // Added isPending for v5 compatibility
        isError: boolean;
        error: TError | null;
        refetch: () => void;
    };
    export function useMutation<TData = unknown, TError = unknown, TVariables = unknown, TContext = unknown>(options: any): {
        mutate: (variables: TVariables, options?: any) => void;
        mutateAsync: (variables: TVariables, options?: any) => Promise<TData>;
        isLoading: boolean;
        isPending: boolean; // Added isPending for v5 compatibility
        isError: boolean;
        isSuccess: boolean;
    };
    export function useQueryClient(): any;
    export class QueryClient {
        constructor(config?: any);
        invalidateQueries(filters?: any): Promise<void>;
        setQueryData(key: any, data: any): void;
    }
    export const QueryClientProvider: any;
}
