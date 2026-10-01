// ==================== MENU ACCESS DATA (clean transfer object) ====================
export interface MenuAccessData {
  id: string;
  menuRoleId: string;
  menuLinkId: string;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  persona?: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

