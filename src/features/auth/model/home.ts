/** Landing page per role. */
export const homeFor = (role?: string) =>
  role === 'agency' ? '/agency/dashboard' : role === 'admin' ? '/admin/dashboard' : '/account';
