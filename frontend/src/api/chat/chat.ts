/**
 * Generated by orval v6.11.0 🍺
 * Do not edit manually.
 * QrTagger
 * OpenAPI spec version: v1
 */
import {
  useQuery,
  useMutation
} from '@tanstack/react-query'
import type {
  UseQueryOptions,
  UseMutationOptions,
  QueryFunction,
  MutationFunction,
  UseQueryResult,
  QueryKey
} from '@tanstack/react-query'
import type {
  IndexChatMessagesResponse,
  ProblemDetails
} from '.././model'
import { useCustomClient } from '.././customClient';
import type { ErrorType } from '.././customClient';


export const useGetApiChatTokenHook = () => {
        const getApiChatToken = useCustomClient<IndexChatMessagesResponse[]>();

        return (
    token: string,
 signal?: AbortSignal
) => {
        return getApiChatToken(
          {url: `/Api/Chat/${token}`, method: 'get', signal
    },
          );
        }
      }
    

export const getGetApiChatTokenQueryKey = (token: string,) => [`/Api/Chat/${token}`];

    
export type GetApiChatTokenQueryResult = NonNullable<Awaited<ReturnType<ReturnType<typeof useGetApiChatTokenHook>>>>
export type GetApiChatTokenQueryError = ErrorType<ProblemDetails>

export const useGetApiChatToken = <TData = Awaited<ReturnType<ReturnType<typeof useGetApiChatTokenHook>>>, TError = ErrorType<ProblemDetails>>(
 token: string, options?: { query?:UseQueryOptions<Awaited<ReturnType<ReturnType<typeof useGetApiChatTokenHook>>>, TError, TData>, }

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey } => {

  const {query: queryOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetApiChatTokenQueryKey(token);

  const getApiChatToken =  useGetApiChatTokenHook();


  const queryFn: QueryFunction<Awaited<ReturnType<ReturnType<typeof useGetApiChatTokenHook>>>> = ({ signal }) => getApiChatToken(token, signal);


  

  const query = useQuery<Awaited<ReturnType<ReturnType<typeof useGetApiChatTokenHook>>>, TError, TData>(queryKey, queryFn, {enabled: !!(token), ...queryOptions}) as  UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryKey;

  return query;
}

export const usePostApiChatAuthHook = () => {
        const postApiChatAuth = useCustomClient<void>();

        return (
    
 ) => {
        return postApiChatAuth(
          {url: `/Api/Chat/Auth`, method: 'post'
    },
          );
        }
      }
    


    export type PostApiChatAuthMutationResult = NonNullable<Awaited<ReturnType<ReturnType<typeof usePostApiChatAuthHook>>>>
    
    export type PostApiChatAuthMutationError = ErrorType<unknown>

    export const usePostApiChatAuth = <TError = ErrorType<unknown>,
    TVariables = void,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<ReturnType<typeof usePostApiChatAuthHook>>>, TError,TVariables, TContext>, }
) => {
      const {mutation: mutationOptions} = options ?? {};

      const postApiChatAuth =  usePostApiChatAuthHook()


      const mutationFn: MutationFunction<Awaited<ReturnType<ReturnType<typeof usePostApiChatAuthHook>>>, TVariables> = () => {
          

          return  postApiChatAuth()
        }

        

      return useMutation<Awaited<ReturnType<typeof postApiChatAuth>>, TError, TVariables, TContext>(mutationFn, mutationOptions);
    }
    