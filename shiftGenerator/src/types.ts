export type Role = {
  id: number;
  name: string;
  requiredPerShift: number;
};
export type ShiftRole = Role & {
  members: number[];
};
export type Member = {
  id: number;
  name: string;
  roles: number[];
  limit: number;
};
export type ShiftMember = Member & {
  used: number;
  usedForRole: { [role: number]: number; };
};

export type MembersByRole = {
  roleId: number,
  memberIds: number[];
};
export type Roles = Role[];
export type ShiftRoles = ShiftRole[];
export type Members = Member[];
export type ShiftMembers = ShiftMember[];
export type numbers = number[];



