import { Injectable } from '@nestjs/common';

type permissionType = {
  [key: string]: string;
};

interface IRBACPermission {
  [key: string]: permissionType;
}

@Injectable()
export class RbacPermissionCacheService {
  private rbacPermissionMap: IRBACPermission = {};

  setData(
    key: string,
    value: {
      permission: {
        key: string;
      };
    }[],
  ) {
    this.rbacPermissionMap[key] = value.reduce((acc, curr) => {
      acc[curr.permission.key] = curr.permission.key;
      return acc;
    }, {});
  }

  getData(key: string) {
    return this.rbacPermissionMap[key];
  }
}
