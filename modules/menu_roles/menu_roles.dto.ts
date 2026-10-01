export type CreateMenuRoleDto = {
  id?: string;
  name?: string;
  nameLang: Record<string, string>;
  persona: string;
  active?: boolean;
};


export type GetMenuRoleDto = {
  id: string;
};

export type SearchMenuRolesDto = {
  searchTerm?: string;
  persona?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
};

