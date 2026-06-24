import type { ApiClient } from '@adapters/api/ApiClient';
import type { Box, BoxType, Group } from '@domain/box/boxTypes';
import { DEFAULT_BOX_TYPE } from '@domain/box/boxTypes';
import type { NavigationPort } from '@domain/navigation/NavigationPort';

export class ListGroupsUseCase {
  constructor(private readonly api: ApiClient) {}

  execute(token: string): Promise<Group[]> {
    return this.api.get<Group[]>('/v1/groups', token);
  }
}

export class CreateGroupUseCase {
  constructor(private readonly api: ApiClient) {}

  execute(token: string): Promise<Group> {
    return this.api.post<Group>('/v1/groups', {}, token);
  }
}

export class ListBoxesUseCase {
  constructor(private readonly api: ApiClient) {}

  execute(groupId: string, token: string): Promise<Box[]> {
    return this.api.get<Box[]>(`/v1/groups/${groupId}/boxes`, token);
  }
}

export interface CreateBoxInput {
  groupId: string;
  name: string;
  type?: BoxType;
}

export class CreateBoxUseCase {
  constructor(private readonly api: ApiClient) {}

  execute(token: string, input: CreateBoxInput): Promise<Box> {
    return this.api.post<Box>(
      '/v1/boxes',
      {
        groupId: input.groupId,
        name: input.name.trim(),
        type: input.type ?? DEFAULT_BOX_TYPE,
      },
      token,
    );
  }
}

export class DeleteBoxUseCase {
  constructor(private readonly api: ApiClient) {}

  execute(boxId: string, token: string): Promise<void> {
    return this.api.delete(`/v1/boxes/${boxId}`, token);
  }
}

export class LeaveGroupUseCase {
  constructor(private readonly api: ApiClient) {}

  execute(groupId: string, token: string): Promise<void> {
    return this.api.delete(`/v1/groups/${groupId}/members`, token);
  }
}

export class SelectGroupUseCase {
  constructor(private readonly navigation: NavigationPort) {}

  async execute(groupId: string): Promise<void> {
    await this.navigation.save({ groupId, boxId: undefined, boxName: undefined });
  }
}

export class SelectBoxUseCase {
  constructor(private readonly navigation: NavigationPort) {}

  async execute(groupId: string, box: Pick<Box, 'id' | 'name'>): Promise<void> {
    await this.navigation.save({ groupId, boxId: box.id, boxName: box.name });
  }
}
