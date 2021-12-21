import { configureStore } from "@reduxjs/toolkit";
import desktopSlice from "desktop/state/desktopSlice";

export default configureStore({
  reducer: {
    desktop: desktopSlice,
  },
});
