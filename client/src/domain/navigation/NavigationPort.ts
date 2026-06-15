export interface NavigationState {
  groupId?: string;
  boxId?: string;
  boxName?: string;
}

export interface NavigationPort {
  load(): Promise<NavigationState>;
  save(state: NavigationState): Promise<void>;
  clear(): Promise<void>;
}
