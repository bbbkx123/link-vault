import { SearchIcon } from "@/components/icons";

type SearchFormProps = {
  basePath: string;
  query: string;
  tag: string;
  placeholder?: string;
};

export function SearchForm({
  basePath,
  query,
  tag,
  placeholder = "搜索标题、链接或标签",
}: SearchFormProps) {
  return (
    <form
      method="get"
      action={basePath}
      className="search-form"
      role="search"
    >
      {tag ? <input type="hidden" name="tag" value={tag} /> : null}
      <SearchIcon size={16} />
      <input
        type="search"
        name="q"
        defaultValue={query}
        maxLength={80}
        placeholder={placeholder}
        aria-label="搜索收藏"
      />
      <button type="submit" className="btn btn-primary btn-sm">
        搜索
      </button>
    </form>
  );
}
