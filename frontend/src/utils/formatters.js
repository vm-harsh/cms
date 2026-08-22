export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatRole(role) {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'FACULTY':
      return 'Faculty Member';
    case 'STUDENT':
      return 'Student';
    default:
      return role;
  }
}

export function getRoleBadgeClass(role) {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-950/70 text-purple-300 border border-purple-800/60';
    case 'FACULTY':
      return 'bg-blue-950/70 text-blue-300 border border-blue-800/60';
    case 'STUDENT':
      return 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}
