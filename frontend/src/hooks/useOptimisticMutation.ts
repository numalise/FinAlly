/**
 * Optimistic mutation hook with consistent error handling
 * Provides standardized toast notifications and error handling
 */

import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage: string;
  errorMessage: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export function useOptimisticMutation<TData = unknown, TVariables = unknown>(
  options: OptimisticMutationOptions<TData, TVariables>
) {
  const toast = useToast();

  return useMutation<TData, Error, TVariables>({
    mutationFn: options.mutationFn,
    onSuccess: (data, variables) => {
      toast({
        title: options.successMessage,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      toast({
        title: options.errorMessage,
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      options.onError?.(error, variables);
    },
  });
}

/**
 * Helper function to create a mutation with custom success/error messages
 */
export function createOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  successMessage: string,
  errorMessage: string
) {
  return (onSuccess?: (data: TData, variables: TVariables) => void) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useOptimisticMutation({
      mutationFn,
      successMessage,
      errorMessage,
      onSuccess,
    });
  };
}
