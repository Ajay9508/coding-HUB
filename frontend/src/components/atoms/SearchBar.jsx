const SearchBar = () => {
  return (
    <div className="flex h-11 w-72 items-center gap-3 rounded-xl border border-border bg-white px-4">
      <span className="text-muted">⌕</span>

      <input
        type="text"
        placeholder="Search platforms, contests..."
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
      />
    </div>
  );
};

export default SearchBar;