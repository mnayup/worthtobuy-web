export interface ActionDef {
  key: string;
  label: string;
  description?: string;
}

export interface ModuleDef {
  key: string;
  label: string;
  group: 'Main' | 'Master Data' | 'Operations' | 'Finance' | 'System';
  actions: ActionDef[];
}

export interface RoleItem {
  id: number;
  name: string;
  description: string | null;
  canViewProfit: boolean;
  permissions: string[];
  userCount: number;
}
