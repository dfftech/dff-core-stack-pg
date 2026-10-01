export type CreateMenuAccessDto = {
  id?: string;
  menuRoleId: string;
  menuLinkId: string;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  persona?: string;
};

export type GetMenuAccessDto = {
  id: string;
};

export type SearchMenuAccessDto = {
  menuRoleId?: string | string[];
  menuLinkId?: string;
  persona?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
};

export type BulkCreateMenuAccessDto = {
  menuRoleId: string;
  menuLinks: Array<{
    menuLinkId: string;
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  }>;
};

export type CheckAccessDto = {
  menuRoleIds: string[];
  menuLinkId: string;
  action: 'read' | 'create' | 'update' | 'delete';
};

