/// <reference types="vite/client" />
// Koha ILS Integration Module
/**
 * Handles interaction with Koha's REST API and caches results in Supabase.
 */

import { supabase } from './supabase';

export interface KohaBiblio {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  availability?: string;
  raw_json?: Record<string, unknown>;
}

export class KohaClient {
  private baseUrl: string;
  private apiKey?: string;
  private authHeader?: string;

  constructor(baseUrl: string, apiKey?: string, username?: string, password?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    if (username && password) {
      this.authHeader = `Basic ${btoa(`${username}:${password}`)}`;
    }
  }

  /**
   * Fetch bibliographic records from Koha API
   */
  async fetchBiblios(query: string): Promise<KohaBiblio[]> {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };

      if (this.apiKey) {
        headers['x-koha-api-key'] = this.apiKey;
      } else if (this.authHeader) {
        headers['Authorization'] = this.authHeader;
      }

      const targetUrl = `${this.baseUrl}/api/v1/public/biblios?q=${encodeURIComponent(query)}`;
      const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('external-proxy', {
        body: { 
          url: targetUrl,
          method: 'GET',
          headers
        }
      });

      if (proxyError) throw proxyError;
      
      const data = proxyResponse.data;
      const biblios: KohaBiblio[] = data.map((item: { biblionumber: number; title: string; author: string; isbn?: string; items_count: number }) => ({
        id: item.biblionumber.toString(),
        title: item.title,
        author: item.author,
        isbn: item.isbn,
        availability: item.items_count > 0 ? 'Available' : 'Reference Only', // Simplified for demo
        raw_json: item as unknown as Record<string, unknown>
      }));

      // Cache results in Supabase
      await this.cacheBiblios(biblios);

      return biblios;
    } catch (error) {
      console.error('Koha Integration Error:', error);
      // Fallback: Try to get from cache if API fails
      return this.getCachedBiblios(query);
    }
  }

  /**
   * Cache results in Supabase koha_books table
   */
  private async cacheBiblios(biblios: KohaBiblio[]) {
    if (biblios.length === 0) return;

    const cacheData = biblios.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      availability: { status: b.availability },
      raw_json: b.raw_json,
      last_synced: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('koha_books')
      .upsert(cacheData, { onConflict: 'id' });

    if (error) {
      console.warn('Failed to cache Koha results:', error);
    }
  }

  /**
   * Retrieve cached results from Supabase
   */
  private async getCachedBiblios(query: string): Promise<KohaBiblio[]> {
    const { data, error } = await supabase
      .from('koha_books')
      .select('*')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Failed to retrieve Koha cache:', error);
      return [];
    }

    return (data || []).map((item: { id: string; title: string; author: string; isbn?: string; availability?: { status: string }; raw_json: Record<string, unknown> }) => ({
      id: item.id,
      title: item.title,
      author: item.author,
      isbn: item.isbn,
      availability: item.availability?.status,
      raw_json: item.raw_json
    }));
  }
}

// Export a default instance using environment variables
const KOHA_URL = import.meta.env.VITE_KOHA_URL || 'https://koha.example.edu';
const KOHA_API_KEY = import.meta.env.VITE_KOHA_API_KEY;

export const koha = new KohaClient(KOHA_URL, KOHA_API_KEY);
