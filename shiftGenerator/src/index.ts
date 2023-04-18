import { getMonthName, getWeekDay, shuffleCollection } from "./utils";
import fs from 'fs';
import { ShiftMembers, ShiftRoles, MembersByRole, Members, Roles, ShiftMember } from "./types";
class ScheduleGenerator {

  private members: ShiftMembers;
  private roles: ShiftRoles;

  private currentShift: MembersByRole[];

  constructor(members: Members, roles: Roles) {
    
    this.members = shuffleCollection<ShiftMember>(members.map(member => {
      return {
        ...member,
        used: 0,
        usedForRole: {}
      };
    }));

    this.roles = roles.map(role => {
      const roleMembers = this.members
        .filter(m => m.roles.some(r => r === role.id))
        .map(m => m.id);
      return {
        ...role,
        members: roleMembers
      };
    }).sort((a, b) => a.members.length - b.members.length);
  }

  private getNextMemberForRoleInCurrentShift(roleId: number) {
    const role = this.roles.find(x => x.id === roleId)
    console.log(`Chosing member for ${role.name}`)

    let availableMembers = this.members
      .filter(member =>
        role.members.find(memberId => memberId === member.id) //members with role
        && !this.currentShift.some(s => s.memberIds.some(m => m === member.id)) //members out of current shift
        && member.limit > member.used //members who doesn't exceed the agreed limite for month
    )
    
    if (availableMembers.length < 1) throw new Error(`No available members for ${role.name}`);
    
    availableMembers.sort((a, b) => {
      const totalUsed = a.used - b.used; //sort by less used
      if (totalUsed !== 0) return totalUsed
      const sameRoleUsed = a.usedForRole[roleId] - b.usedForRole[roleId]; //sort by less used for the same role
      return !isNaN(sameRoleUsed) ? sameRoleUsed : 0;
    })
    console.log(` - ${availableMembers[0].name}`)

    return availableMembers[0];
  }

  private addMemberToRoleInCurrentShift(roleId: number) {
    const memberId = this.getNextMemberForRoleInCurrentShift(roleId)?.id;
    let i = this.currentShift.findIndex(x => x.roleId === roleId);
    if (i < 0)
      this.currentShift.push({ roleId, memberIds: [memberId] });
    else
      this.currentShift[i].memberIds.push(memberId);
  }

  populateShift() {
    console.log(`Populating shift`)
    this.currentShift = [];
    this.roles
      .forEach(role => {
        for (let i = 0; i < role.requiredPerShift; i++) {
          this.addMemberToRoleInCurrentShift(role.id);
        }
      });
  }

  nextShift() {
    this.populateShift();
    const shift = this.currentShift.reduce((current: { [role: string]: string; }, item: MembersByRole) => {
      const members = item.memberIds.map(memberId => {
        const i = this.members.findIndex(member => member.id === memberId);
        this.members[i].used++;
        if (!this.members[i].usedForRole[item.roleId]) this.members[i].usedForRole[item.roleId] = 0;
        this.members[i].usedForRole[item.roleId]++;
        return this.members[i].name;
      });
      const roleName = this.roles.find(role => role.id === item.roleId)?.name;
      const key = roleName.startsWith('Vocal') ? 'Vocal' : roleName;
      if (!current[key]) current[key] = members.join(', ');
      else current[key] = [current[key], ...members].join(', ');
      return current;
    }, {});

    return shift;
  }

  getShifts(count: number, date: Date, shiftDay: string) {
    while (getWeekDay(date) !== shiftDay) {
      date.setDate(date.getDate() + 1);
    }
    console.log(`Get ${count} shifts for ${shiftDay} from ${date.toISOString()}`)
    const shifts = [];
    for (var i = 0; i < count; i++) {
      console.log(`Get shift number ${i + 1}`)
      shifts.push({
        date: new Date(date),
        shift: this.nextShift()
      });
      date.setDate(date.getDate() + 7);
    }
    return shifts;
  }
}
function run(day: string, referenceDate: Date, count:number = 5) {
  try {
    console.log(`Get members and roles for shifts`)
    const members: Members = JSON.parse(fs.readFileSync('members.json').toString());
    const roles: Roles = JSON.parse(fs.readFileSync('roles.json').toString());

    const instance = new ScheduleGenerator(members, roles);

    

    const data = instance.getShifts(count, referenceDate, day);
    data.forEach(item => {
      let shift = `Domingo - ${item.date.getDate()} de ${getMonthName(item.date)}\n---\n`;
      const rolesOrdered = ['Ministro', 'Vocal', 'Teclado', 'Violao', 'Guitarra', 'Baixo', 'Bateria'];
      rolesOrdered.forEach(role => {
        shift += role + ' - ' + item.shift[role] + '\n';
      });
      console.log(shift);
    });
  } catch (e) {
    console.error(e.message, e)
  }
  debugger;
}

run('Domingo', new Date('2023-05-01'))

