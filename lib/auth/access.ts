import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  memberAc,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  startup: ["view", "edit", "delete"],
  weekly_update: ["submit"],
  task: ["manage"],
  settings: ["view", "edit"],
} as const;

const ac = createAccessControl(statement);

const owner = ac.newRole({
  startup: ["view", "edit", "delete"],
  weekly_update: ["submit"],
  task: ["manage"],
  settings: ["view", "edit"],
  ...adminAc.statements,
});

const admin = ac.newRole({
  startup: ["view", "edit"],
  weekly_update: ["submit"],
  task: ["manage"],
  settings: ["view", "edit"],
  ...adminAc.statements,
});

const member = ac.newRole({
  startup: ["view"],
  weekly_update: ["submit"],
  task: ["manage"],
  ...memberAc.statements,
});

const viewer = ac.newRole({
  startup: ["view"],
});

export { ac, owner, admin, member, viewer };
