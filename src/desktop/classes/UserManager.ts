import { updateUsers } from "desktop/state/desktopSlice";
import type { User } from "types/User";
import store from "desktop/state/store";

export class UserManager {
  private users: Map<string, User> = new Map();
  private usersCache: Map<string, User> = new Map();

  public async getConnectedUserIds(httpUrs: string): Promise<string[]> {
    const result = await kintone.proxy(
      `${httpUrs}?appId=${kintone.app.getId()}&recordId=${kintone.app.record.getId()}`,
      "GET",
      {},
      {}
    );
    return JSON.parse(result[0]).userIds.filter(
      (userId: string) => userId !== kintone.getLoginUser().id
    );
  }

  public getUserName(userId: string) {
    return this.users.get(userId)?.name || "";
  }

  public async addUsers(userIds: string[]) {
    const ids = userIds.filter((userId) => !this.users.has(userId));
    const cachedUsers = ids
      .map((userId) => this.usersCache.get(userId))
      .filter((user): user is User => user !== undefined);
    const uncachedUserIds = ids.filter(
      (userId) => !this.usersCache.has(userId)
    );
    const uncachedUsers: User[] = uncachedUserIds.length
      ? (
          await kintone.api("/v1/users", "GET", {
            ids: uncachedUserIds,
          })
        ).users.map(({ id, code, name }: User) => ({
          id,
          code,
          name,
        }))
      : [];
    uncachedUsers.forEach((uncachedUser) => {
      this.usersCache.set(uncachedUser.id, uncachedUser);
    });
    [...cachedUsers, ...uncachedUsers].forEach((user) => {
      this.users.set(user.id, user);
    });
    store.dispatch(updateUsers([...this.users.values()]));
  }

  public removeUser(userId: string) {
    this.users.delete(userId);
    store.dispatch(updateUsers([...this.users.values()]));
  }
}
