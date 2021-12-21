import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Config } from "types/Config";

export const slice = createSlice({
  name: "config",
  initialState: { socketUrl: "", httpUrl: "", temporaryApp: "" },
  reducers: {
    updateSocketUrl: (config: Config, action: PayloadAction<string>) => {
      config.socketUrl = action.payload;
    },
    updateHttpUrl: (config: Config, action: PayloadAction<string>) => {
      config.httpUrl = action.payload;
    },
    updateTemporaryApp: (config: Config, action: PayloadAction<string>) => {
      config.temporaryApp = action.payload;
    },
  },
});

export const { updateSocketUrl, updateHttpUrl, updateTemporaryApp } =
  slice.actions;
export const selectSocketUrl = ({ config }: { config: Config }) =>
  config.socketUrl;
export const selectHttpUrl = ({ config }: { config: Config }) => config.httpUrl;
export const selectTemporaryApp = ({ config }: { config: Config }) =>
  config.temporaryApp;

export default slice.reducer;
