import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import profileReducer from "./profileSlice";
import jobReducer from "./jobSlice";
import applicationReducer from "./applicationSlice";
import interviewReducer from "./interviewSlice";
import subscriptionReducer from "./subscriptionSlice";
import NotificationReducer from "./NotificationSlice";
import AnalyticsReducer from "./analyticsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    jobs: jobReducer,
    applications: applicationReducer,
    interviews: interviewReducer,
    subscription: subscriptionReducer,
    notifications: NotificationReducer,
    analytics: AnalyticsReducer,
  },

  // Optional: useful for debugging in dev
  devTools: import.meta.env.MODE !== "production",
});

export default store;