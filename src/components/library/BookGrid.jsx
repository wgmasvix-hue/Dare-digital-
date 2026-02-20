import BookCard from './BookCard';
import styles from './BookGrid.module.css';

export default function BookGrid({ books }) {
  if (!books || books.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No books found.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
