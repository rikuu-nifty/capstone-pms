export type Paginator<T> = {
  data: T[];
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  // meta: {
  //   current_page: number;
  //   from: number | null;
  //   last_page: number;
  //   per_page: number;
  //   to: number | null;
  //   total: number;
  // };
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};
