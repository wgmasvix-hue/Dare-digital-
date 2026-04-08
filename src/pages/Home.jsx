import { useEffect, useState } from "react"
import { getBooks } from "../services/books"
import BookList from "../components/BookList"
import SearchBar from "../components/SearchBar"
import AIChat from "../components/AIChat"

export default function Home() {
  const [books, setBooks] = useState([])
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const data = await getBooks()
    setBooks(data)
    setFiltered(data)
  }

  function handleSearch(term) {
    const filteredBooks = books.filter(b =>
      b.title.toLowerCase().includes(term.toLowerCase())
    )
    setFiltered(filteredBooks)
  }

  return (
    <div>
      <h1>DARE Digital Library</h1>
      <SearchBar onSearch={handleSearch} />
      <BookList books={filtered} />
      <AIChat />
    </div>
  )
}
