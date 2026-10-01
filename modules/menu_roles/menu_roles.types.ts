// ==================== MENU ROLES DATA (clean transfer object) ====================
export interface MenuRolesData {
  id: string;
  name: string;
  nameLang: Record<string, string>;
  persona: string;
  active: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

