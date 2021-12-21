import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Text, Label, Button } from "@kintone/kintone-ui-component";
import {
  selectSocketUrl,
  selectHttpUrl,
  selectTemporaryApp,
  updateSocketUrl,
  updateHttpUrl,
  updateTemporaryApp,
} from "config/state/configSlice";
import "config/style/config.css";

const App: React.VFC = () => {
  const dispatch = useDispatch();
  const socketUrl = useSelector(selectSocketUrl);
  const httpUrl = useSelector(selectHttpUrl);
  const temporaryApp = useSelector(selectTemporaryApp);

  return (
    <div className="kintone-co-edit-config">
      <div className="kintone-co-edit-config-field">
        <Label text="socket url" isRequired />
        <Text
          value={socketUrl}
          onChange={(value) => {
            dispatch(updateSocketUrl(value || ""));
          }}
          placeholder="wss://*****.execute-api.ap-northeast-1.amazonaws.com/Prod"
        />
      </div>
      <div className="kintone-co-edit-config-field">
        <Label text="http url" isRequired />
        <Text
          value={httpUrl}
          onChange={(value) => {
            dispatch(updateHttpUrl(value || ""));
          }}
          placeholder="https://*****.execute-api.ap-northeast-1.amazonaws.com/Prod"
        />
      </div>
      <div className="kintone-co-edit-config-field">
        <Label text="temporary app id" isRequired />
        <Text
          value={temporaryApp}
          onChange={(value) => {
            dispatch(updateTemporaryApp(value || ""));
          }}
          placeholder="1"
        />
      </div>
      <div className="kintone-co-edit-config-field">
        <Button
          text="submit"
          type="submit"
          onClick={() => {
            kintone.plugin.app.setConfig({
              socketUrl,
              httpUrl,
              temporaryApp,
            });
          }}
        />
      </div>
    </div>
  );
};
export default App;
