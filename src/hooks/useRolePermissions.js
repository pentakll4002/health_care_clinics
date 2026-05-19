import { useMemo } from 'react';
import { ROUTE_PERMISSIONS, ROUTE_ROLES } from '../constants/permissions';
import { useUser } from './useUser';
import { useMyPermissions } from './useMyPermissions';

export function useRolePermissions() {
  const { user, nhanVien, isLoading } = useUser();
  const { data: myPermData, isLoading: isPermLoading } = useMyPermissions();

  const roleCode = useMemo(() => {
    const mapRole = (rawRole) => {
      const code = rawRole.toLowerCase();
      if (code === 'doctor') return 'doctors';
      if (code === 'receptionist') return 'receptionists';
      if (code === 'manager') return 'managers';
      return code;
    };

    if (nhanVien) {
      const maNhom = nhanVien.maNhom || nhanVien.MaNhom;
      if (maNhom) return mapRole(maNhom);
    }
    
    const userNhanVien = user?.nhan_vien || user?.nhanVien;
    if (userNhanVien) {
      const maNhom = userNhanVien.maNhom || userNhanVien.MaNhom;
      if (maNhom) return mapRole(maNhom);
    }
    
    // Fallback: use user.role directly
    if (user?.role) {
      const role = user.role.toLowerCase();
      if (role === 'admin') return 'admin';
      if (role === 'doctor') return 'doctors';
      if (role === 'receptionist') return 'receptionists';
      if (role === 'patient') return 'patient';
    }
    
    return null;
  }, [user, nhanVien]);

  const canAccessRoute = (route) => {
    if (!roleCode || !route) return false;
    
    if (roleCode === '@admin') return true;

    const perms = myPermData?.data || myPermData?.permissions;
    const requiredPermission = ROUTE_PERMISSIONS[route];
    if (Array.isArray(perms) && requiredPermission) {
      if (perms.includes(requiredPermission)) return true;
    }
    
    const allowedRoles = ROUTE_ROLES[route] || [];
    return allowedRoles.includes(roleCode);
  };

  const canAccessAnyRoute = (routes) => {
    if (!routes || routes.length === 0) return false;
    return routes.some((route) => canAccessRoute(route));
  };

  const isRole = (role) => {
    return roleCode === role;
  };

  const isAnyRole = (roles) => {
    if (!roles || roles.length === 0) return false;
    return roles.includes(roleCode);
  };

  return {
    roleCode,
    isLoading: isLoading || isPermLoading,
    canAccessRoute,
    canAccessAnyRoute,
    isRole,
    isAnyRole,
  };
}
