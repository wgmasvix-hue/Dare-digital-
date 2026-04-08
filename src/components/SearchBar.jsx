export default function SearchBar({ onSearch }) {
  return (
    <input
      placeholder="Search books..."
      onChange={(e) => onSearch(e.target.value)}
    />
  )
}
