/**
 * Utility for managing offline storage of remixed content and books
 */

const REMIX_KEY_PREFIX = 'dare_remix_';
const OFFLINE_BOOK_PREFIX = 'dare_offline_';

export const offlineStorage = {
  /**
   * Save remixed content for a book
   */
  saveRemix: (bookId: string, remixData: Record<string, unknown>) => {
    try {
      const key = `${REMIX_KEY_PREFIX}${bookId}`;
      localStorage.setItem(key, JSON.stringify({
        ...remixData,
        timestamp: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Failed to save remix to offline storage:', error);
      return false;
    }
  },

  /**
   * Get remixed content for a book
   */
  getRemix: (bookId: string) => {
    try {
      const key = `${REMIX_KEY_PREFIX}${bookId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get remix from offline storage:', error);
      return null;
    }
  },

  /**
   * Save a book for offline reading
   */
  saveBookOffline: (bookId: string, bookData: Record<string, unknown>) => {
    try {
      const key = `${OFFLINE_BOOK_PREFIX}${bookId}`;
      localStorage.setItem(key, JSON.stringify({
        ...bookData,
        offlineAt: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Failed to save book for offline reading:', error);
      return false;
    }
  },

  /**
   * Get an offline book
   */
  getOfflineBook: (bookId: string) => {
    try {
      const key = `${OFFLINE_BOOK_PREFIX}${bookId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get offline book:', error);
      return null;
    }
  },

  /**
   * List all offline books
   */
  listOfflineBooks: () => {
    const books = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(OFFLINE_BOOK_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!);
          books.push(data);
        } catch {
          // Skip invalid data
        }
      }
    }
    return books;
  },

  /**
   * Remove a book from offline storage
   */
  removeOffline: (bookId: string) => {
    localStorage.removeItem(`${OFFLINE_BOOK_PREFIX}${bookId}`);
    localStorage.removeItem(`${REMIX_KEY_PREFIX}${bookId}`);
  }
};
