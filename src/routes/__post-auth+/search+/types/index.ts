export interface SearchItem {
  id: number;
  title: string;
  subtitle: string;
  href: string;
}

export interface SearchGroup {
  key: string;
  label: string;
  items: SearchItem[];
}

export interface SearchResponse {
  query: string;
  total: number;
  groups: SearchGroup[];
}
