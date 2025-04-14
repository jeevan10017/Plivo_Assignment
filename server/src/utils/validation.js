export const isValidClerkOrgId = (id) => {
    return typeof id === 'string' && id.startsWith('org_') && id.length >= 24;
  };
  
  export const generateSlug = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  