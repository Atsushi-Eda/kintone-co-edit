import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import App from "desktop/components/App";
import store from "desktop/state/store";
import {
  showEvent,
  saveEvent,
  changeEvent,
  detailShowEvent,
} from "desktop/functions/event";
import { SocketManager } from "desktop/classes/SocketManager";
import { UserManager } from "desktop/classes/UserManager";
import { ChangeChecker } from "desktop/classes/ChangeChecker";
import type { Config } from "types/Config";
import {
  alertAndReload,
  notify,
  addEmptyBox,
  setFieldValues,
  revisionCheck,
  saveToTemporaryApp,
  removeFromTemporaryApp,
  getChangesFromTemporaryApp,
  replaceUndefinedWithEmptyString,
} from "desktop/functions/util";

((PLUGIN_ID) => {
  const socketManager = new SocketManager();
  const userManager = new UserManager();
  const changeChecker = new ChangeChecker();
  const config: Config = kintone.plugin.app.getConfig(PLUGIN_ID);

  detailShowEvent(() => {
    if (socketManager.isConnected()) {
      location.reload();
    }
  });

  showEvent(({ event }) => {
    revisionCheck(event);
    userManager.getConnectedUserIds(config.httpUrl).then((userIds) => {
      userManager.addUsers(userIds);
    });
    getChangesFromTemporaryApp(config.temporaryApp, event).then((changes) => {
      if (!changes.length) {
        return;
      }
      changeChecker.addChangesByOthers(changes);
      setFieldValues(changes);
      notify("他のユーザーが編集中のデータを反映しました。");
    });
    socketManager.connect(config.socketUrl);
    socketManager.onChange(({ userId, change }) => {
      changeChecker.addChangesByOthers([change]);
      setFieldValues([change]);
      notify(
        `${userManager.getUserName(userId)}が「${
          change.label
        }」を編集しました。`
      );
    });
    socketManager.onSave(({ userId }) => {
      alertAndReload(
        `${userManager.getUserName(
          userId
        )}がレコードを保存しました。リロードします。`
      );
    });
    socketManager.onConnect(async ({ userId }) => {
      await userManager.addUsers([userId]);
      notify(`${userManager.getUserName(userId)}が編集を開始しました。`);
    });
    socketManager.onDisconnect(({ userId }) => {
      userManager.removeUser(userId);
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>,
      addEmptyBox()
    );
  });

  saveEvent(async ({ event }) => {
    socketManager.save();
    await removeFromTemporaryApp(config.temporaryApp, event);
  });

  changeEvent(({ event, change }) => {
    if (!changeChecker.check(change)) {
      return;
    }
    const formattedChange = replaceUndefinedWithEmptyString(change);
    socketManager.change(formattedChange);
    saveToTemporaryApp(config.temporaryApp, event, formattedChange);
  });
})(kintone.$PLUGIN_ID);
