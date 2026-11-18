export enum Permission {
  OWNER_ALL = 'owner.all',

  USER_READ = 'user.read',
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',

  ROLE_READ = 'role.read',
  ROLE_CREATE = 'role.create',
  ROLE_UPDATE = 'role.update',
  ROLE_DELETE = 'role.delete',

  PERMISSION_READ = 'permission.read',

  POST_READ = 'post.read',
  POST_CREATE = 'post.create',
  POST_UPDATE = 'post.update',
  POST_DELETE = 'post.delete',
}

// addmission user all api and post read and write
// owner all permission with Owne organization  all api with out addmission
export enum RootRole {
  OWNER = 'OWNER',
  ADDMISSION = 'ADDMISSION',
}
