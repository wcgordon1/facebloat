import { Doc } from "@cvx/_generated/dataModel";

export type User = Doc<"users"> & {
  // Profile fields from userProfiles table
  username?: string;
  imageId?: Doc<"userProfiles">["imageId"];
  image?: string;
  customerId?: string;
  // UI fields
  avatarUrl?: string;
  subscription?: Doc<"subscriptions"> & {
    planKey: Doc<"plans">["key"];
  };
};
