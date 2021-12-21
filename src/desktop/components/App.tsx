import React from "react";
import { useSelector } from "react-redux";
import { selectUsers } from "desktop/state/desktopSlice";
import "desktop/style/desktop.css";

const App: React.VFC = () => {
  const users = useSelector(selectUsers);

  return (
    <div className="kintone-co-edit-desktop">
      <p>編集中ユーザー</p>
      {users.length ? (
        users.map((user) => (
          <p key={user.id}>
            <a href={`/k/#/people/user/${user.code}`}>{user.name}</a>
          </p>
        ))
      ) : (
        <p>なし</p>
      )}
    </div>
  );
};
export default App;
