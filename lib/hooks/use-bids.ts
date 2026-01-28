import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bidsApi } from '@/lib/api'
import type { CreateBidInput, UpdateBidInput } from '@/lib/types'
import toast from 'react-hot-toast'

export function useMyBids() {
  return useQuery({
    queryKey: ['bids', 'my'],
    queryFn: () => bidsApi.getMyBids(),
  })
}

export function useGigBids(gigId: string) {
  return useQuery({
    queryKey: ['bids', 'gig', gigId],
    queryFn: () => bidsApi.getGigBids(gigId),
    enabled: !!gigId,
  })
}

export function useBid(id: string) {
  return useQuery({
    queryKey: ['bid', id],
    queryFn: () => bidsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateBid(gigId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<CreateBidInput, 'gigId'>) =>
      bidsApi.create({ ...data, gigId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['bids', 'gig', gigId] })
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] })
      toast.success('Bid placed successfully!')
    },
    onError: () => {
      toast.error('Failed to place bid')
    },
  })
}

export function useUpdateBid(id: string, gigId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateBidInput) => bidsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bid', id] })
      queryClient.invalidateQueries({ queryKey: ['bids', 'my'] })
      if (gigId) {
        queryClient.invalidateQueries({ queryKey: ['bids', 'gig', gigId] })
      }
      toast.success('Bid updated!')
    },
    onError: () => {
      toast.error('Failed to update bid')
    },
  })
}

export function useWithdrawBid(id: string, gigId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => bidsApi.withdraw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bid', id] })
      queryClient.invalidateQueries({ queryKey: ['bids', 'my'] })
      if (gigId) {
        queryClient.invalidateQueries({ queryKey: ['bids', 'gig', gigId] })
      }
      toast.success('Bid withdrawn')
    },
    onError: () => {
      toast.error('Failed to withdraw bid')
    },
  })
}

export function useAcceptBid(gigId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bidId: string) => bidsApi.accept(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] })
      queryClient.invalidateQueries({ queryKey: ['bids', 'gig', gigId] })
      queryClient.invalidateQueries({ queryKey: ['gigs', 'my'] })
      toast.success('Bid accepted! The artist has been notified.')
    },
    onError: () => {
      toast.error('Failed to accept bid')
    },
  })
}

export function useRejectBid(gigId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bidId: string) => bidsApi.reject(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', 'gig', gigId] })
      toast.success('Bid rejected')
    },
    onError: () => {
      toast.error('Failed to reject bid')
    },
  })
}
