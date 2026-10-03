// ==================== MENU LINKS DATA (clean transfer object) ====================
export interface MenuLinksData {
  id: string;
  active: boolean;
  href: string;
  icon: string;
  menuGroupId: string;
  name: string;
  nameLang: Record<string, string>;
  priority: number;
  persona?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

