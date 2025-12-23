import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '@/lib/api';

// Admin Stats
export const useAdminStats = (options = {}) => {
  return useQuery('adminStats', async () => {
    const { data } = await api.get('/admin/stats');
    return data;
  }, options);
};

// Recent Activities
export const useRecentActivities = (limit = 10, options = {}) => {
  return useQuery(['recentActivities', limit], async () => {
    const { data } = await api.get(`/admin/activities?limit=${limit}`);
    return data;
  }, options);
};

// Revenue Analytics
export const useRevenueAnalytics = (period = 'month', options = {}) => {
  return useQuery(['revenueAnalytics', period], async () => {
    const { data } = await api.get(`/admin/revenue?period=${period}`);
    return data;
  }, options);
};

// Users Management
export const useAdminUsers = (page = 1, limit = 10, search = '', role = '') => {
  return useQuery(['adminUsers', page, limit, search, role], async () => {
    const { data } = await api.get(
      `/admin/users?page=${page}&limit=${limit}&search=${search}&role=${role}`
    );
    return data;
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ userId, updates }: { userId: string; updates: any }) => {
      const { data } = await api.put(`/admin/users/${userId}`, updates);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        queryClient.invalidateQueries('adminStats');
      }
    }
  );
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (userId: string) => {
      const { data } = await api.delete(`/admin/users/${userId}`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        queryClient.invalidateQueries('adminStats');
      }
    }
  );
};

// Events Management
export const useAdminEvents = (page = 1, limit = 10, search = '', status = '', options = {}) => {
  return useQuery(['adminEvents', page, limit, search, status], async () => {
    const { data} = await api.get(
      `/admin/events?page=${page}&limit=${limit}&search=${search}&status=${status}`
    );
    return data;
  }, options);
};

export const useUpdateEventStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ eventId, status }: { eventId: string; status: string }) => {
      const { data } = await api.put(`/admin/events/${eventId}/status`, { status });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminEvents');
        queryClient.invalidateQueries('adminStats');
      }
    }
  );
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (eventId: string) => {
      const { data } = await api.delete(`/admin/events/${eventId}`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminEvents');
        queryClient.invalidateQueries('adminStats');
      }
    }
  );
};
