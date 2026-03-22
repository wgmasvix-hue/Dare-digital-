import BookCard from './BookCard';
import { motion, AnimatePresence } from 'motion/react';

export default function BookGrid({ books, loading, variant = 'grid' }) {
  if (loading) {
    return (
      <div className={`
        grid gap-6 
        ${variant === 'tile' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 
          variant === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 
          'grid-cols-1'}
      `}>
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-lg font-medium">No books found matching your criteria.</p>
        <p className="text-sm">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className={`
      grid gap-6 
      ${variant === 'tile' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 
        variant === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 
        'grid-cols-1'}
    `}>
      <AnimatePresence mode="popLayout">
        {books.map((book) => (
          <BookCard 
            key={book.id} 
            publication={book} 
            variant={variant} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
