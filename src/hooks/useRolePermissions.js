import { useMemo } from 'react';
import { ROUTE_PERMISSIONS, ROUTE_ROLES } from '../constants/permissions';
import { useUser } from './useUser';
import { useMyPermissions } from './useMyPermissions';

export function useRolePermissions() {
  const { user, nhanVien, isLoading } = useUser();
  const { data: myPermData, isLoading: isPermLoading } = useMyPermissions();

  const roleCode = useMemo(() => {
    console.log('🔍 useRolePermissions - Debug:', {
      hasUser: !!user,
      hasNhanVien: !!nhanVien,
      userData: user,
      nhanVienData: nhanVien,
    });
    
    const mapRole = (rawRole) => {
      const code = rawRole.toLowerCase();
      if (code === 'doctor') return 'doctors';
      if (code === 'receptionist') return 'receptionists';
      if (code === 'manager') return 'managers';
      return code;
    };

    if (nhanVien) {
      // Backend returns maNhom, convert to lowercase and map to plural if needed
      const maNhom = nhanVien.maNhom || nhanVien.MaNhom;
      if (maNhom) {
        const code = mapRole(maNhom);
        console.log('Role từ nhanVien:', code);
        return code;
      }
    }
    
    const userNhanVien = user?.nhan_vien || user?.nhanVien;
    if (userNhanVien) {
      const maNhom = userNhanVien.maNhom || userNhanVien.MaNhom;
      if (maNhom) {
        const code = mapRole(maNhom);
        console.log('Role từ user.nhanVien:', code);
        return code;
      }
    }
    
    // Fallback: use user.role directly
    if (user?.role) {
      const role = user.role.toLowerCase();
      if (role === 'admin') {
        console.log('Role từ user.role: admin');
        return 'admin';
      }
      if (role === 'doctor') {
        console.log('Role từ user.role: doctors');
        return 'doctors';
      }
      if (role === 'receptionist') {
        console.log('Role từ user.role: receptionists');
        return 'receptionists';
      }
      if (role === 'patient') {
        console.log('Role từ user.role: patient');
        return 'patient';
      }
    }
    
    console.warn('Không tìm thấy role code');
    return null;
  }, [user, nhanVien]);

  if (!isLoading && roleCode) {
    console.log('Role Code:', roleCode);
    console.log('User:', user);
    console.log('Nhan Vien:', nhanVien);
  }

  const canAccessRoute = (route) => {
    if (!roleCode || !route) return false;
    
    if (roleCode === '@admin') return true;

    const perms = myPermData?.data || myPermData?.permissions;
    const requiredPermission = ROUTE_PERMISSIONS[route];
    if (Array.isArray(perms) && requiredPermission) {
      if (perms.includes(requiredPermission)) return true;
    }
    
    const allowedRoles = ROUTE_ROLES[route] || [];
    const hasAccess = allowedRoles.includes(roleCode);
    
    if (!hasAccess && roleCode) {
      console.log(`❌ Role ${roleCode} không có quyền truy cập route: ${route}`);
      console.log(`   Allowed roles:`, allowedRoles);
    }
    
    return hasAccess;
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

