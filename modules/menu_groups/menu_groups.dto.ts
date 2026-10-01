export type CreateMenuGroupDto = {
  id?: string;
  active?: boolean;
  icon: string;
  name?: string;
  nameLang: Record<string, string>;
  priority: number;
  persona: string;
};


export type GetMenuGroupDto = {
  id: string;
};

export type SearchMenuGroupsDto = {
  searchTerm?: string;
  persona?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
};

