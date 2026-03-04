interface Profile {
  role: 'customer' | 'store_manager' | 'admin';
  store_id?: string;
}

export const isAdmin = (profile: Profile | null): boolean => {
  return profile?.role === 'admin';
};

export const isStoreManager = (profile: Profile | null): boolean => {
  return profile?.role === 'store_manager';
};

export const isCustomer = (profile: Profile | null): boolean => {
  return profile?.role === 'customer';
};

export const hasStoreAccess = (profile: Profile | null): boolean => {
  return isStoreManager(profile) && !!profile?.store_id;
};

export const canAccessAdmin = (profile: Profile | null): boolean => {
  return isAdmin(profile);
};

export const canAccessStore = (profile: Profile | null): boolean => {
  return isStoreManager(profile) || isAdmin(profile);
};
