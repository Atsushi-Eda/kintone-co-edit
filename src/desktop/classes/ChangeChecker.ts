import type { Change } from "types/change";
import { alertAndReload } from "desktop/functions/util";
import _ from "lodash";

export class ChangeChecker {
  readonly POST_LIMIT = 100;
  private count = 0;
  private changesByOthers: Change[] = [];

  public check(change: Change): boolean {
    return this.checkModifier(change) && this.checkCount();
  }

  private checkCount(): boolean {
    if (this.POST_LIMIT > this.count) {
      this.count++;
      return true;
    }
    alertAndReload("変更通知数制限に達しました。リロードします。");
    return false;
  }

  private checkModifier(change: Change): boolean {
    const changeIndex = this.changesByOthers.findIndex(
      (changeByOthers) =>
        !changeByOthers.resolved && this.isSameChange(change, changeByOthers)
    );
    if (changeIndex < 0) {
      return true;
    }
    this.changesByOthers[changeIndex].resolved = true;
    return false;
  }

  private isSameChange(change: Change, changeByOthers: Change): boolean {
    return (
      change.code === changeByOthers.code &&
      _.isEqual(change.recordField.value, changeByOthers.recordField.value)
    );
  }

  public addChangesByOthers(changes: Change[]) {
    this.changesByOthers.push(...changes);
  }
}
