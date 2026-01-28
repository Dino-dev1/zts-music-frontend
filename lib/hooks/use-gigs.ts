import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gigsApi } from '@/lib/api'
import type { GigFilters, CreateGigInput, UpdateGigInput } from '@/lib/types'
import toast from 'react-hot-toast'

export function useGigs(filters?: GigFilters) {
  return useQuery({
    queryKey: ['gigs', 'discover', filters],
    queryFn: () => gigsApi.getAll(filters),
  })
}

export function useMyGigs(filters?: Partial<GigFilters>) {
  return useQuery({
    queryKey: ['gigs', 'my', filters],
    queryFn: () => gigsApi.getMyGigs(filters),
  })
}

export function useGig(id: string) {
  return useQuery({
    queryKey: ['gig', id],
    queryFn: () => gigsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateGig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGigInput) => gigsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs', 'my'] })
      toast.success('Gig created successfully!')
    },
    onError: () => {
      toast.error('Failed to create gig')
    },
  })
}

export function useUpdateGig(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateGigInput) => gigsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', id] })
      queryClient.invalidateQueries({ queryKey: ['gigs', 'my'] })
      toast.success('Gig updated!')
    },
    onError: () => {
      toast.error('Failed to update gig')
    },
  })
}

export function usePublishGig(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => gigsApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', id] })
      queryClient.invalidateQueries({ queryKey: ['gigs', 'my'] })
      toast.success('Gig published! Artists can now bid.')
    },
    onError: () => {
      toast.error('Failed to publish gig')
    },
  })
}

export function useCloseGig(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => gigsApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', id] })
      queryClient.invalidateQueries({ queryKey: ['gigs', 'my'] })
      toast.success('Gig closed')
    },
    onError: () => {
      toast.error('Failed to close gig')
    },
  })
}

export function useDeleteGig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => gigsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs', 'my'] })
      toast.success('Gig deleted')
    },
    onError: () => {
      toast.error('Failed to delete gig')
    },
  })
}
