import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '@/lib/api';

// Organizer Stats
export const useOrganizerStats = (options = {}) => {
  return useQuery('organizerStats', async () => {
    const { data } = await api.get('/organizer/stats');
    return data;
  }, options);
};

// Revenue Analytics
export const useOrganizerRevenue = (period = 'month', options = {}) => {
  return useQuery(['organizerRevenue', period], async () => {
    const { data } = await api.get(`/organizer/revenue?period=${period}`);
    return data;
  }, options);
};

// Events Management
export const useOrganizerEvents = (page = 1, limit = 10, search = '', status = '', options = {}) => {
  return useQuery(['organizerEvents', page, limit, search, status], async () => {
    const { data } = await api.get(
      `/organizer/events?page=${page}&limit=${limit}&search=${search}&status=${status}`
    );
    return data;
  }, options);
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (eventData: Record<string, unknown>) => {
      const { data } = await api.post('/organizer/events', eventData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('organizerEvents');
        queryClient.invalidateQueries('organizerStats');
      }
    }
  );
};

export const useUpdateOrganizerEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ eventId, updates }: { eventId: string; updates: Record<string, unknown> }) => {
      const { data } = await api.put(`/organizer/events/${eventId}`, updates);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('organizerEvents');
        queryClient.invalidateQueries('organizerStats');
      }
    }
  );
};

export const useDeleteOrganizerEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (eventId: string) => {
      const { data } = await api.delete(`/organizer/events/${eventId}`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('organizerEvents');
        queryClient.invalidateQueries('organizerStats');
      }
    }
  );
};

// Event Attendees
export const useEventAttendees = (eventId: string) => {
  return useQuery(['eventAttendees', eventId], async () => {
    const { data } = await api.get(`/organizer/events/${eventId}/attendees`);
    return data;
  }, {
    enabled: !!eventId
  });
};

// Ticket Verification
export const useVerifyTicket = () => {
  return useMutation(
    async ({ ticketCode, qrCode }: { ticketCode?: string; qrCode?: string }) => {
      const { data } = await api.post('/organizer/verify-ticket', { ticketCode, qrCode });
      return data;
    }
  );
};
