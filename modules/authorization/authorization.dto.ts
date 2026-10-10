export type AuthorizationRequestDto = {
  persona: string;
  roles: string[];
};

export type PermissionData = {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
};

export type AuthorizationMenuData = PermissionData & {
  id: string;
  type: "group" | "link";
  name: string;
  nameLang: Record<string, string>;
  icon: string;
  href?: string;
  priority: number;
  persona: string | null;
  menuGroupId?: string | null;
  children: AuthorizationMenuData[];
};
