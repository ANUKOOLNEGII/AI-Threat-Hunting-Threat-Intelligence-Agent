import type { IOCItem, IOCFilters } from '../types/ioc.types';
import api from './api';

export const iocService = {
  async getIocs(
    filters: IOCFilters,
    page = 1,
    pageSize = 10
  ): Promise<{ items: IOCItem[]; total: number; page: number; pageSize: number }> {
    const params: Record<string, any> = {
      page,
      pageSize,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    };
    if (filters.query) params.query = filters.query;
    if (filters.type && filters.type !== 'all') params.type = filters.type;
    if (filters.reputation && filters.reputation !== 'all') params.reputation = filters.reputation;
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    const response = await api.get('/iocs', { params });
    return response.data;
  },

  async getIocById(id: string): Promise<IOCItem | null> {
    const response = await api.get(`/iocs/${id}`);
    return response.data;
  }
};
