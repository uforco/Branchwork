# Branchwork API and technical documentation

This document describes behavior visible in the current source, Prisma schema, and checked-in migration files. DTO validation annotations are described as declared rules; the application bootstrap does not currently install a `ValidationPipe`, so they are not automatically enforced at runtime.

## 1. Project overview

Branchwork is a NestJS HTTP API for managing organizations, user/staff accounts, branches, access roles, permissions, and products. Authentication is based on JWTs. Passwords are hashed with Argon2. PostgreSQL persistence is accessed with Prisma 7 and the `@prisma/adapter-pg` driver adapter.

### Main implemented features

- Create an organization and its initial owner account.
- Log in and receive a signed bearer token.
- Create, list, update, and delete staff accounts.
- Create, list, update, and delete branches.
- Create and manage roles and their permission assignments.
- Create, filter, update, and delete products.
- Seed a catalog of permission keys.

## 2. Application architecture

### Modules and responsibilities

| Module | Responsibility |
| --- | --- |
| `AuthModule` | Public organization creation and login; JWT issuance and password verification. |
| `StaffModule` | Staff/user creation, listing, updates, removal, and role selection. |
| `BranchModule` | Branch creation, organization-scoped listing, update, and removal. |
| `AccessRoleModule` | Role creation, role/permission listing, permission assignment updates, role removal. |
| `ProductsModule` | Product create/list/filter/update/delete and branch selection. |
| `DbPrismaModule` | Global Prisma client backed by PostgreSQL adapter. |
| `EncryptedPasswordModule` | Argon2 hash and verify service. |
| `RbacPermissionCacheModule` | In-memory map of a user's permission keys. |

Entities under each feature folder are empty placeholder classes and are not used to define persistence; Prisma models define the data schema.

### Request and authentication flow

1. `POST /auth/login` finds a user by email, verifies the Argon2 password hash, records the role's permissions in the in-memory cache, and signs a JWT.
2. The response token string is prefixed with `Bearer `, and token lifetime is six hours.
3. A route with `@Permissions(...)` invokes the globally registered `AuthGuard`. The guard extracts `Authorization: Bearer <token>`, verifies it with `JWT_SECRET`, loads a limited user record, and attaches it as `request.user`.
4. The guard checks the cached permission set. Any listed permission or `owner.all` grants access.
5. The `@User()` parameter decorator exposes the attached user or one of its fields to a controller.

Routes with no permission metadata are treated as public by the guard. The Swagger generator nevertheless assigns bearer security to every documented route.

# RBAC behavior and limitations

Permission identifiers use lowercase resource/action keys: `user.read`, `role.create`, `branch.update`, `product.delete`, and so on. `owner.all` is the global permission shortcut. The permission list is seeded by `prisma/seed.ts` from `prisma/initData.json`.

`@Permissions` stores required permission metadata. `AuthGuard` uses an **any-of** check: one requested permission or `owner.all` is sufficient. The cache is an ordinary in-process object, populated only during login, not shared between instances, and not refreshed when role permissions change. A token may authenticate but fail authorization after process restart until the user logs in again. If the guard has no cached permission set it returns false, which Nest ordinarily reports as 403. There is no separate role guard; role names are consulted by selected services for scoping decisions.

`RootRole` declares `OWNER` and `ADDMISSION`; the Prisma `Roles` enum declares `owner`, `branch_manager`, and `stock_clerk`. These are separate definitions; runtime role names are strings stored in the `Role` model. Registration creates an `OWNER` role. Do not assume the two enums are synchronized.

### Guards, decorators, middleware

- **Global guard:** `AuthGuard` is registered through `APP_GUARD`.
- **Permission decorator:** `@Permissions(...Permission[])` sets metadata for guarded endpoints.
- **User decorator:** `@User()` and `@User('organizationId')` read `request.user` after guard authentication.
- **Middleware/interceptors:** No app middleware or Nest interceptor is registered in `main.ts`; the guard method that populates request user context is a private helper, not a Nest interceptor.
- **Validation:** DTO classes declare `class-validator` constraints, but there is no global or route-level validation pipe in the scanned controllers/bootstrap.

## 3. Database documentation

The schema is split into `prisma/schema.prisma` and files in `prisma/models/`. PostgreSQL is the provider. The Prisma client output is `prisma/generated`. IDs are Prisma-side UUID defaults (`@default(uuid())`); SQL migrations do not define database UUID defaults.

### Models

| Model | Fields and types | Keys, relationships, rules |
| --- | --- | --- |
| `Organization` | `id String`; `organization_name String` | UUID primary key. One-to-many to `User`, `Branches`, `Role`, and `Products`. Organization name is not unique. |
| `User` | `id String`; `name String`; `email String`; `password String`; `createAt DateTime`; `organizationId String?`; `branch_id String?` | UUID primary key; email unique. Optional organization and branch foreign keys; optional one-to-one `UserRole`; has `Role[]` through the optional `Role.userId` relation. Password stores an Argon2 hash in service-created records. |
| `Branches` | `id String`; `branch_name String`; `city String`; `organizationId String?` | UUID primary key; `branch_name` globally unique (not compound-scoped by organization). Optional organization relation; one-to-many to users and products. |
| `Role` | `id String`; `name String`; `description String?`; `createdAt DateTime`; `updatedAt DateTime`; `userId String?`; `organizationId String` | UUID primary key; unique composite `(name, userId)`; required organization FK; optional user FK; one-to-many `UserRole`, many-to-many permissions via `RolePermission`. |
| `UserRole` | `userId String`; `roleId String`; `assignedAt DateTime` | Composite primary key is `(roleId, userId)` in current schema; `userId` is additionally unique, so one role assignment per user; indexed `roleId`; FKs to User and Role. |
| `Permission` | `id String`; `key String`; `description String?`; `createdAt DateTime` | UUID primary key; unique `key`; joined to roles through `RolePermission`. |
| `RolePermission` | `roleId String`; `permissionId String` | Composite primary key `(roleId, permissionId)`; FKs to Role and Permission. |
| `Products` | `id String`; `product_name String`; `sku String`; `categury String`; `price Decimal`; `stock Decimal`; `branchId String?`; `organizationId String`; `createAt DateTime`; `update DateTime` | UUID primary key; required organization FK; optional branch FK; no unique index on SKU. Decimal defaults are 0; timestamps use `now()` and `@updatedAt`. |

`Roles` is also a Prisma enum with values `owner`, `branch_manager`, and `stock_clerk`; current feature logic primarily uses free-form `Role.name` strings instead.

### Constraints and migration observations

- Unique indexes: `User.email`, `Branches.branch_name`, `Permission.key`, `UserRole.userId`, and `Role(name, userId)`. IDs also have explicit unique indexes as well as primary keys in migration history.
- `UserRole.roleId` has a non-unique index.
- `RolePermission`, `Role`, `UserRole`, and `Products` relations use restrictive deletes in the checked-in migrations unless a later migration changed that edge.
- Deleting an organization referenced by a user/branch sets that FK to null; deleting a branch referenced by a user/product sets the corresponding FK to null. Organization deletion with roles/products is restricted.
- `Products.branchId` is optional in the current schema and latest migration. Initial migration history briefly made it required, then changed it to optional.
- The migration adding `Role.organizationId` is required and has no default; applying that migration to a preexisting populated Role table may require data remediation. No migration seeding of roles or organizations is present.
- Service-level scoping/business rules are not all database constraints. For example, product SKU is not unique despite DTO descriptions calling it unique, and branch-name uniqueness is global at the database level.

### Seeded permission keys

`owner.all`; `user.read`, `user.create`, `user.update`, `user.delete`; `role.read`, `role.create`, `role.update`, `role.delete`; `permission.read`; `branch.read`, `branch.create`, `branch.update`, `branch.delete`; `product.read`, `product.create`, `product.update`, `product.delete`.

## 4. API documentation

Base URL for local development: `http://localhost:3000`. No global route prefix or version prefix is set. For protected routes, send `Authorization: Bearer <JWT>`. All routes accept/return JSON where they have a body/response. Swagger UI is at `/docs`.

**Validation note:** Below, “DTO rules” means the class decorators present in source. No `ValidationPipe` is configured, so requests are not automatically checked against these rules by the current bootstrap.

**Response note:** Examples show returned service/controller data with illustrative UUIDs and dates. Nest's default POST status is 201 and other standard methods generally return 200; no explicit `@HttpCode` overrides were found. Uncaught errors use Nest's default exception response shape unless a service catches/translates them.

### Root / application

#### `GET /`

- **Title/description:** Health-like greeting; returns a plain string.
- **Authentication/permission:** Public; no `@Permissions` metadata.
- **Parameters, headers, body:** None required.
- **DTO rules:** None.
- **Success (200):** `"Hello World!"`.
- **Errors:** No route-specific errors implemented.

#### `GET /users`

- **Title/description:** Lists permission keys. The route name says users, but service queries `Permission` and returns keys.
- **Authentication:** Bearer JWT required.
- **Permission:** `user.read` or `owner.all`.
- **Parameters/body:** None.
- **Success (200):** ` ["owner.all", "user.read", "user.create"] ` (full seeded list when seed data is present).
- **Errors:** Missing/invalid/expired token: 401. Authenticated user lacking cached permission: ordinarily 403. Guard verification may report 500 for some token verification errors.

### Auth module

#### `POST /auth/create-organization`

- **Title/description:** Creates an organization, first user, owner role, role permission assignment, and user-role assignment in a transaction.
- **Authentication/permission:** Public; no permission metadata.
- **Headers:** `Content-Type: application/json`.
- **Body DTO:** `email` valid email/non-empty; `password` string/non-empty; `organization_name` string/non-empty; `name` string/non-empty.

```json
{
  "email": "owner@example.com",
  "password": "change-me",
  "organization_name": "Example Organization",
  "name": "Example Owner"
}
```

- **Success (201):** `{ "message": "organization created successfully", "data": { "id": "<uuid>", "name": "Example Owner", "email": "owner@example.com", "password": "<argon2-hash>", "organizationId": "<uuid>", "organization": { "id": "<uuid>", "organization_name": "Example Organization" }, "userRole": { "userId": "<uuid>", "roleId": "<uuid>", "role": { "name": "OWNER", "rolePermission": [{ "permission": { "key": "owner.all" } }] } } } }`.
- **Errors:** 409 if email already exists. 500 if DB access fails, or the seeded `owner.all` permission is missing. The service response includes the created user object, which contains the password hash.

#### `POST /auth/login`

- **Title/description:** Verifies credentials, populates permission cache, and issues a JWT.
- **Authentication/permission:** Public.
- **Headers:** `Content-Type: application/json`.
- **Body DTO:** `email` valid email/non-empty; `password` string/non-empty.

```json
{ "email": "owner@example.com", "password": "change-me" }
```

- **Success (201):**

```json
{
  "access_token": "Bearer <jwt>",
  "data": {
    "id": "<user-uuid>",
    "name": "Example Owner",
    "email": "owner@example.com",
    "organization": { "id": "<organization-uuid>", "organization_name": "Example Organization" },
    "role": "OWNER",
    "branch": null
  }
}
```

- **Errors:** 404 with `invalid cadential` for unknown email or wrong password; 500 for internal lookup, hash verification, or token errors. `access_token` already includes the `Bearer ` prefix; the guard expects the conventional `Authorization: Bearer <jwt>` header.

### Staff module

#### `POST /staff/Add-new-staff`

- **Title/description:** Creates a user and assigns a role in a transaction. Organization comes from the authenticated user; branch comes from the request body.
- **Authentication:** Bearer JWT.
- **Permission:** `user.create` or `owner.all`.
- **Body DTO:** `email` valid email/non-empty; `password`, `name`, `branch_id`, `roleId` strings/non-empty.

```json
{
  "email": "staff@example.com",
  "password": "change-me",
  "name": "Branch Staff",
  "branch_id": "<branch-uuid>",
  "roleId": "<role-uuid>"
}
```

- **Success (201):** `{ "success": true, "message": "Staff created successfully", "data": { "id": "<uuid>", "name": "Branch Staff", "email": "staff@example.com", "password": "<argon2-hash>", "organizationId": "<organization-uuid>", "branch_id": "<branch-uuid>", "userRole": { "userId": "<uuid>", "roleId": "<role-uuid>", "role": { "name": "Stock_clerk" } } } }`.
- **Errors:** 409 on duplicate email; 500 for other create/assignment failures. Created data includes the password hash.

#### `GET /staff/selete-new-staff-role`

- **Title/description:** Returns roles and permission descriptions that can be selected for a staff member.
- **Authentication:** Bearer JWT.
- **Permission:** `user.create` or `owner.all`.
- **Parameters/body:** None.
- **Success (200):** Array of `{ "id", "name", "description", "rolePermission": [{ "permission": { "id", "description" } }] }`. Results are scoped to the caller's organization; a non-owner additionally sees only roles associated with that user, per the current service filter.
- **Errors:** 401 for token problems; 403 when permission is not cached/allowed; database failures are not explicitly translated in this method.

#### `GET /staff`

- **Title/description:** Lists users in the caller's organization with branch and role/permission details.
- **Authentication:** Bearer JWT.
- **Permission:** `user.read` or `owner.all`.
- **Parameters/body:** None.
- **Success (200):** Array of user summaries: `id`, `name`, `email`, `branch`, and `userRole.role` with role id/name/description and permission id/description. Password is not selected.
- **Scoping:** Owner sees organization users; other roles are filtered to `branch_id` of the caller.
- **Errors:** 401/403; DB errors may be logged and translated to 500.

#### `PATCH /staff/:id`

- **Title/description:** Updates staff profile and assigned role in a transaction; hashes a supplied password.
- **Authentication:** Bearer JWT.
- **Permission:** `user.update` or `owner.all`.
- **Path:** `id` is user ID string.
- **Body DTO:** Optional `email` (email validation inherited), `password`, `name`, `branch_id`, and `roleId`; decorated string fields are optional in the update DTO (email optional through `PartialType`).

```json
{ "name": "Updated Staff", "branch_id": "<branch-uuid>", "roleId": "<role-uuid>" }
```

- **Success (200):** `{ "success": true, "message": "Staff updated successfully", "data": { "id": "<uuid>", "name": "Updated Staff", "email": "staff@example.com", "organizationId": "<organization-uuid>", "branch_id": "<branch-uuid>", "userRole": { "role": { "name": "Stock_clerk" } } } }`.
- **Errors:** 409 when caller tries to update own account; 404 when Prisma reports missing staff; other errors map to 500. Note the service uses `roleId` in the `userRole.update` data even when it is omitted, so a partial body without `roleId` may fail.

#### `DELETE /staff/:id`

- **Title/description:** Removes the user's role assignment and then the user.
- **Authentication:** Bearer JWT.
- **Permission:** `user.delete` or `owner.all`.
- **Path:** `id` is user ID string. No body.
- **Success (200):** `{ "success": true, "message": "Staff removed successfully" }`.
- **Errors:** 404 when user is not found; 500 for delete failures. There is no self-delete check in this route's service.

### Branch module

#### `POST /branch/add-new-branch`

- **Title/description:** Creates a branch for the authenticated user's organization.
- **Authentication:** Bearer JWT.
- **Permission:** `branch.create` or `owner.all`.
- **Body DTO:** `branch_name`, `city` are strings/non-empty; organization ID is supplied from user context, not body.

```json
{ "branch_name": "Gulshan", "city": "Dhaka" }
```

- **Success (201):** `{ "message": "Branch created successfully!", "data": { "id": "<uuid>", "branch_name": "Gulshan", "city": "Dhaka", "organizationId": "<organization-uuid>" } }`.
- **Errors:** 409 for duplicate branch (name is globally unique in DB); 500 for other errors.

#### `GET /branch/All`

- **Title/description:** Lists branches belonging to the authenticated user's organization.
- **Authentication:** Bearer JWT.
- **Permission:** `branch.read` or `owner.all`.
- **Parameters/body:** None.
- **Success (200):** `{ "message": "All branches fetch successfully!", "data": [{ "id": "<uuid>", "branch_name": "Gulshan", "city": "Dhaka", "organizationId": "<uuid>", "staff": 2 }] }`.
- **Errors:** 401/403; DB errors map to 500.

#### `PATCH /branch/:id`

- **Title/description:** Replaces supplied branch name and/or city.
- **Authentication:** Bearer JWT.
- **Permission:** `branch.update` or `owner.all`.
- **Path:** `id` is branch ID string.
- **Body DTO:** Optional `branch_name` and `city`, each string when provided.

```json
{ "city": "Banani" }
```

- **Success (200):** `{ "message": "Branch updated successfully!", "data": { "id": "<uuid>", "branch_name": "Gulshan", "city": "Banani", "organizationId": "<uuid>" } }`.
- **Errors:** 404 if branch does not exist. Database errors from update are not explicitly caught here.

#### `DELETE /branch/delete/:id`

- **Title/description:** Deletes a branch by ID.
- **Authentication:** Bearer JWT.
- **Permission:** `branch.delete` or `owner.all`.
- **Path:** `id` is branch ID string. No body.
- **Success (200):** `{ "message": "Branch deleted successfully!" }`.
- **Errors:** 404 if branch not found; 500 for other failures. DB relations set user/product branch FKs to null in the current migration.

### Access-role module

#### `POST /access-role/add-role`

- **Title/description:** Creates a role for the caller's organization and attaches permission IDs in a transaction.
- **Authentication:** Bearer JWT.
- **Permission:** `role.create` or `owner.all`.
- **Body DTO:** `name` string; `description` optional string; `permission` array of objects with `permissionId` UUID v4.

```json
{
  "name": "Stock_clerk",
  "description": "Can update inventory",
  "permission": [{ "permissionId": "<permission-uuid>" }]
}
```

- **Success (201):** Created Role model `{ "id": "<uuid>", "name": "Stock_clerk", "description": "Can update inventory", "createdAt": "<iso-date>", "updatedAt": "<iso-date>", "userId": "<caller-uuid>", "organizationId": "<organization-uuid>" }`. Permission assignments are created but not included in this response.
- **Errors:** Service catches failures and returns 500, including invalid/missing permission foreign keys.

#### `GET /access-role/permission-list`

- **Title/description:** Lists available permission IDs, keys, and descriptions.
- **Authentication:** Bearer JWT.
- **Permission:** `permission.read` or `owner.all`.
- **Parameters/body:** None.
- **Success (200):** Array such as `[{ "id": "<uuid>", "key": "product.read", "description": "View products and product details" }]`. Non-owner roles filter out `owner.all`.
- **Errors:** 401/403; no custom database error translation.

#### `GET /access-role/all-role-permission`

- **Title/description:** Lists caller-organization roles with permission IDs and descriptions.
- **Authentication:** Bearer JWT.
- **Permission:** `role.read` or `owner.all`.
- **Parameters/body:** None.
- **Success (200):** Array of `{ "id", "name", "description", "rolePermission": [{ "permission": { "id", "description" } }] }`.
- **Scoping:** Always filters to caller organization. Non-owner path further filters to roles associated with caller and containing a non-`owner.all` permission.
- **Errors:** 401/403; no custom database error translation.

#### `PATCH /access-role/:id`

- **Title/description:** Updates role name/description and, if a non-empty permission array is sent, replaces its permission assignments.
- **Authentication:** Bearer JWT.
- **Permission:** `role.update` or `owner.all`.
- **Path:** `id` is role ID string.
- **Body DTO:** Optional `name`, `description`, and `permission[]` (`permissionId` UUID v4).

```json
{ "description": "Updated inventory permissions", "permission": [{ "permissionId": "<permission-uuid>" }] }
```

- **Success (200):** `{ "message": "updated success", "data": [{ "id": "<uuid>", "name": "Stock_clerk", "description": "Updated inventory permissions", "rolePermission": [{ "permission": { "id": "<uuid>", "description": "View products and product details" } }] }] }`.
- **Errors:** 409 if `id` equals caller user ID (the check compares role ID to user ID); 500 for update/permission assignment errors. Empty `permission: []` does not clear existing permissions because replacement occurs only for a non-empty array. Update is not scoped to organization in the Prisma `role.update` call.

#### `DELETE /access-role/:id`

- **Title/description:** Removes user-role assignments and permission assignments, then deletes the role.
- **Authentication:** Bearer JWT.
- **Permission:** `role.delete` or `owner.all`.
- **Path:** `id` is role ID string. No body.
- **Success (200):** `{ "message": "deleted success - This action removes a #<id> accessRole", "data": null }`.
- **Errors:** 409 if role is not found in the caller's permitted scope; 500 for delete errors. The role and its assignments are checked/deleted in separate operations, not one transaction.

### Products module

#### `POST /products`

- **Title/description:** Creates a product in the authenticated user's organization.
- **Authentication:** Bearer JWT.
- **Permission:** `product.create` or `owner.all`.
- **Body DTO:** `product_name` string/non-empty/max 150; `sku` string/non-empty/max 100; `categury` string/non-empty/max 100; `price` and `stock` numbers, at most two decimal places and minimum 0; `branchId` string/non-empty.

```json
{
  "product_name": "iPhone 16 Pro",
  "sku": "IPHONE-16-PRO",
  "categury": "Electronics",
  "price": 999.99,
  "stock": 10,
  "branchId": "<branch-uuid>"
}
```

- **Success (201):** Product record with `id`, `product_name`, `sku`, `categury`, decimal `price`/`stock`, `branchId`, caller `organizationId`, `createAt`, and `update`.
- **Errors:** Service catches synchronous errors and translates them to 500. Prisma calls return promises, so asynchronous rejections may not be caught by the current non-`async` try/catch.

#### `GET /products/create-product-selete-branch`

- **Title/description:** Lists branches available for product assignment.
- **Authentication:** Bearer JWT.
- **Permission:** `product.create` or `owner.all`.
- **Parameters/body:** None.
- **Success (200):** Array of `{ "id", "branch_name", "city" }`, filtered to caller organization; non-owner is additionally filtered to their own `branch_id`.
- **Errors:** 401/403; service catches and translates database errors to 500.

#### `GET /products`

- **Title/description:** Lists products with optional case-insensitive substring filters.
- **Authentication:** Bearer JWT.
- **Permission:** `product.read` or `owner.all`.
- **Query parameters:** Optional `product_name`, `sku`, and `categury`, all strings. Filters combine with AND. Owner results are organization-scoped; non-owner results are additionally branch-scoped.
- **Headers/body:** Authorization bearer header; no body.
- **Example:** `/products?product_name=iphone&sku=16&categury=electronics`.
- **Success (200):** Array of matching full Product model records as described above.
- **Errors:** 401/403; service database failures map to 500.

#### `PATCH /products/:id`

- **Title/description:** Updates supplied product fields.
- **Authentication:** Bearer JWT.
- **Permission:** `product.update` or `owner.all`.
- **Path:** `id` is product ID string.
- **Body DTO:** Optional `product_name` (string, max 150), `sku` (string, max 100), `categury` (string, max 100), `price` and `stock` (number, max two decimal places, minimum 0). `branchId` is inherited as optional from `PartialType(CreateProductDto)`, but the subclass does not redeclare its string validators.

```json
{ "stock": 14, "price": 949.99 }
```

- **Success (200):** Updated Product model.
- **Errors:** Service catches synchronous errors and maps them to 500; asynchronous Prisma rejections may escape the current try/catch. No organization scoping is applied to the update query.

#### `DELETE /products/:id`

- **Title/description:** Deletes product by ID.
- **Authentication:** Bearer JWT.
- **Permission:** `product.delete` or `owner.all`.
- **Path:** `id` is product ID string. No body.
- **Success (200):** `{ "status": true, "massage": "Product Remove SuccessFully" }`.
- **Errors:** Service catches synchronous errors and returns 500; asynchronous Prisma rejection handling may escape the current try/catch. No organization scoping is applied to the delete query.

## 5. Authentication details

Passwords are hashed and verified by `EncryptedPasswordService` using Argon2. Organization registration stores a new user and organization, creates a role named `OWNER`, assigns the seeded `owner.all` permission, and creates `UserRole`, all within a Prisma transaction. Login identifies users by unique email and returns 404 `invalid cadential` for both unknown email and incorrect password.

JWT payload includes `sub` (user ID), plus `organizationId` and `branch_id` when present. `AuthModule` uses global `JwtModule` configuration with an expiry of one day, while `AuthService.createJwtToken` overrides expiry to six hours. Verification uses `JWT_SECRET`. Send the token in the `Authorization` header as `Bearer <jwt>`; because login returns `Bearer <jwt>` in its `access_token` value, clients should either pass that value directly as the header or remove its prefix and add the header prefix once.

The token itself is not used to hold permissions. The process-local permission cache is populated from role-permission rows at login. The guard separately reloads current basic user fields from the database and attaches them to the request. The decorator returns `id`, `name`, `email`, `organizationId`, `branch_id`, and nested role name. It does not add `organizationId` or `branch_id` to a response unless a service returns those fields.

## 6. Authorization / RBAC

### Permission catalogue

| Resource | Keys |
| --- | --- |
| Owner shortcut | `owner.all` |
| Users/staff | `user.read`, `user.create`, `user.update`, `user.delete` |
| Roles | `role.read`, `role.create`, `role.update`, `role.delete` |
| Permission catalogue | `permission.read` |
| Branches | `branch.read`, `branch.create`, `branch.update`, `branch.delete` |
| Products | `product.read`, `product.create`, `product.update`, `product.delete` |

The guard's authorization is permission based and any-of. Many services add organization/branch filtering for list operations. Some write operations use only ID and permission checks; product update/delete and branch update/delete are not organization-scoped in their Prisma filters. Treat this as a current implementation limitation.

## 7. Business logic and known behavior

- **Organization registration:** Requires a pre-seeded `owner.all`; creates initial owner records in one transaction. Duplicate email yields 409. Response includes the user's password hash.
- **Staff:** Creation adds staff to the caller's organization and assigns provided branch and role. Listing is organization-wide for `OWNER`, branch-limited otherwise. Update prevents self-update, but its role update uses the `roleId` value even if omitted. Removal deletes UserRole then User.
- **Branches:** Creation associates caller organization. Listing returns a `staff` count. Duplicate detection checks organization/name/city, but DB uniqueness is global on `branch_name`. Update/delete look up by ID without organization scoping.
- **Roles:** Creation records creator as `Role.userId`, organization, and selected permission IDs. Permission listing hides `owner.all` for non-owner. Listing is organization-filtered. Updating replaces permissions only when the new array is non-empty. Deletion manually clears assignments before deleting role.
- **Products:** Creation forces organization to caller's organization, but body `branchId` is accepted. List combines case-insensitive contains filters and scopes to organization, and to branch for non-owner. Update/delete are by product ID only. Schema has no unique SKU constraint.
- **Root `/users`:** Returns permission keys despite its route name.
- No pagination, sorting, or standard response envelope is implemented for list endpoints.

## 8. Error handling

There is no custom global exception filter. Nest's built-in exceptions generally produce JSON shaped like:

```json
{ "message": "Unauthorized", "statusCode": 401 }
```

For validation errors, Nest's default `ValidationPipe` response is not applicable because no such pipe is installed. Services explicitly throw `ConflictException` (409), `NotFoundException` (404), `UnauthorizedException` (401), or `InternalServerErrorException` (500) in selected paths. Guard returning false ordinarily becomes 403. Prisma or unhandled errors may produce Nest's default 500 response; several service try/catch blocks surround non-awaited Prisma promises and therefore may not catch asynchronous rejections.

## 9. Security and configuration

- Argon2 password hash and verification are implemented.
- JWT signing and verification use `JWT_SECRET`; tokens expire after six hours in the login service.
- Protected route access depends on `AuthGuard` plus `@Permissions` metadata.
- Password hashes are selected out of normal staff listing but are returned by organization registration and staff creation responses.
- The permission cache is in-memory and logged permissions are written to `console.log` by the guard (`Permission APIs ==== ...`).
- No HTTP-only cookie, CORS configuration, rate limiting, Helmet setup, throttling, or request validation pipe is configured in `main.ts`/`AppModule`.
- Swagger marks all operations bearer-authenticated although some routes are public at runtime.
- Secrets must be provided through environment configuration and not committed. `.env.example` includes variable names, but the checked-in example has no values.

## 10. API usage examples

Set a local base URL and obtain the login token (returned with the literal `Bearer ` prefix):

```bash
BASE_URL=http://localhost:3000
curl -sS -X POST "$BASE_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@example.com","password":"change-me"}'
```

Use the returned value in a protected route. Replace `<jwt>` with the JWT only, without the response's `Bearer ` prefix:

```bash
curl -sS "$BASE_URL/branch/All" \
  -H 'Authorization: Bearer <jwt>'
```

Create a branch:

```bash
curl -sS -X POST "$BASE_URL/branch/add-new-branch" \
  -H 'Authorization: Bearer <jwt>' \
  -H 'Content-Type: application/json' \
  -d '{"branch_name":"Gulshan","city":"Dhaka"}'
```

Search products:

```bash
curl -sS "$BASE_URL/products?product_name=iphone&categury=electronics" \
  -H 'Authorization: Bearer <jwt>'
```

## 11. Development notes and limitations

- `start:prod` runs migration deployment and seeding on every start.
- `compose.yml` defines PostgreSQL only; it does not orchestrate the API.
- The Dockerfile installs pnpm only in the builder stage but invokes `pnpm` in the production image, where it is not installed.
- `start:prod` runs `node dist/src/main`; verify the Nest build output layout when changing build settings.
- DTO validator decorators are not enforced without a validation pipe.
- Role and permission changes do not invalidate/update cached permissions for already logged-in users.
- Scoping is inconsistent: some read operations are tenant/branch scoped while several update/delete operations accept a bare ID.
- The `Roles` Prisma enum and application role-name constants have differing values/casing; runtime `Role.name` is a string.
- `UpdateAccessRoleDto` and `UpdateProductDto` import `PartialType` from `@nestjs/swagger`, while other update DTOs use `@nestjs/mapped-types`.
- `Products` uses the field spelling `categury` in DTO, API, and database. Clients must use that spelling.
- Tests exist for modules and services under `src/**/*.spec.ts` plus an e2e test under `test/`; their presence does not demonstrate all listed behavior is covered.
