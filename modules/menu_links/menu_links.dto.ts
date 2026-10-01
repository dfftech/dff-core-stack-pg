export type CreateMenuLinkDto = {
  id?: string;
  active?: boolean;
  href: string;
  icon: string;
  menuGroupId: string;
  name?: string;
  nameLang: Record<string, string>;
  priority: number;
  persona?: string;
};


export type GetMenuLinkDto = {
  id: string;
};

export type SearchMenuLinksDto = {
  searchTerm?: string;
  menuGroupId?: string;
  persona?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
};

