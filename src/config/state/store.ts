import { configureStore } from "@reduxjs/toolkit";
import configSlice from "config/state/configSlice";

export default configureStore({
  reducer: {
    config: configSlice,
  },
});
