// ==================== MENU GROUPS DATA (clean transfer object) ====================
export interface MenuGroupsData {
  id: string;
  active: boolean;
  icon: string;
  name: string;
  nameLang: Record<string, string>;
  priority: number;
  persona: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

