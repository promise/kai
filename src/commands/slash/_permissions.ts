import { PermissionLevel } from "../../types/permissions";

const permissions: Record<string, PermissionLevel> = {
  autoresponse: "STAFF",
  "quick-response": "STAFF",
  ticket: "STAFF",
};

export default permissions;
