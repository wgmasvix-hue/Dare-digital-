export default function BookList({ books }) {
  return (
    <div>
      {books.map(book => (
        <div key={book.id}>
          <a href={book.file_url} target="_blank">
            {book.title}
          </a>
        </div>
      ))}
    </div>
  )
}
