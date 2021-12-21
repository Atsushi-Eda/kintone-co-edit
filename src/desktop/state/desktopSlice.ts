import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "types/User";

export const slice = createSlice({
  name: "desktop",
  initialState: { users: [] },
  reducers: {
    updateUsers: (
      desktop: { users: User[] },
      action: PayloadAction<User[]>
    ) => {
      desktop.users = action.payload;
    },
  },
});

export const { updateUsers } = slice.actions;
export const selectUsers = ({ desktop }: { desktop: { users: User[] } }) =>
  desktop.users;

export default slice.reducer;
