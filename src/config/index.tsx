import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import App from "config/components/App";
import store from "config/state/store";
import {
  updateSocketUrl,
  updateHttpUrl,
  updateTemporaryApp,
} from "config/state/configSlice";
import type { Config } from "types/Config";

((PLUGIN_ID) => {
  const config: Config = kintone.plugin.app.getConfig(PLUGIN_ID);
  store.dispatch(updateSocketUrl(config.socketUrl || ""));
  store.dispatch(updateHttpUrl(config.httpUrl || ""));
  store.dispatch(updateTemporaryApp(config.temporaryApp || ""));

  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("config-root")
  );
})(kintone.$PLUGIN_ID);
