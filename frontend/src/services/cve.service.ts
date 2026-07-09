import type { CVEItem, CVEFilters } from '../types/cve.types';
import api from './api';

export const cveService = {
  async getCves(
    filters: CVEFilters,
    page = 1,
    pageSize = 10
  ): Promise<{ items: CVEItem[]; total: number; page: number; pageSize: number }> {
    const params: Record<string, any> = {
      page,
      pageSize,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    };
    if (filters.query) params.query = filters.query;
    if (filters.severity && filters.severity !== 'all') params.severity = filters.severity;
    if (filters.isExploited && filters.isExploited !== 'all') params.isExploited = filters.isExploited;
    if (filters.vendor) params.vendor = filters.vendor;
    if (filters.product) params.product = filters.product;
    const response = await api.get('/cves', { params });
    return response.data;
  },

  async getCveById(cveId: string): Promise<CVEItem | null> {
    const response = await api.get(`/cves/${cveId}`);
    return response.data;
  }
};
