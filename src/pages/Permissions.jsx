import styled from 'styled-components';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const Layout = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6f8;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

function Permissions() {
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupForm, setGroupForm] = useState({ TenNhom: '', MaNhom: '' });
  const [funcForm, setFuncForm] = useState({ TenChucNang: '', TenManHinhTuongUong: '' });
  const [selectedFunctionIds, setSelectedFunctionIds] = useState([]);

  const groupsQuery = useQuery({
    queryKey: ['admin', 'nhom-nguoi-dung'],
    queryFn: async () => {
      const res = await axiosInstance.get('/nhom-nguoi-dung');
      return res.data;
    },
  });

  const functionsQuery = useQuery({
    queryKey: ['admin', 'chuc-nang'],
    queryFn: async () => {
      const res = await axiosInstance.get('/chuc-nang');
      return res.data;
    },
  });

  const permissionsQuery = useQuery({
    queryKey: ['admin', 'phan-quyen', 'nhom', selectedGroupId],
    enabled: !!selectedGroupId,
    queryFn: async () => {
      const res = await axiosInstance.get(`/phan-quyen/nhom/${selectedGroupId}`);
      return res.data;
    },
  });

  const groups = groupsQuery.data?.data || [];
  const functions = functionsQuery.data?.data || [];

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      const firstId = groups[0].ID_Nhom ?? groups[0].ID_NhomNguoiDung ?? groups[0].id;
      if (firstId) setSelectedGroupId(firstId);
    }
  }, [groups, selectedGroupId]);

  const currentPermissionIds = useMemo(() => {
    const rows = permissionsQuery.data || [];
    return rows
      .map((r) => r.ID_ChucNang || r.chucNang?.ID_ChucNang || r.chuc_nang?.ID_ChucNang)
      .filter(Boolean);
  }, [permissionsQuery.data]);

  useEffect(() => {
    setSelectedFunctionIds(currentPermissionIds);
  }, [currentPermissionIds, selectedGroupId]);

  const createGroupMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post('/nhom-nguoi-dung', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Tạo nhóm người dùng thành công');
      groupsQuery.refetch();
      setGroupForm({ TenNhom: '', MaNhom: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo nhóm người dùng thất bại');
    },
  });

  const createFunctionMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post('/chuc-nang', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Tạo chức năng thành công');
      functionsQuery.refetch();
      setFuncForm({ TenChucNang: '', TenManHinhTuongUong: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo chức năng thất bại');
    },
  });

  const assignPermissionsMutation = useMutation({
    mutationFn: async ({ idNhom, functionIds }) => {
      const res = await axiosInstance.post(`/phan-quyen/nhom/${idNhom}/assign-multiple`, {
        chuc_nangs: functionIds,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật phân quyền thành công');
      permissionsQuery.refetch();
      queryClient.invalidateQueries({ queryKey: ['my-permissions'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật phân quyền thất bại');
    },
  });

  const toggleFunction = (id) => {
    setSelectedFunctionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const isLoading = groupsQuery.isLoading || functionsQuery.isLoading;
  const hasSelectedGroup = !!selectedGroupId;

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return groups.find((g) => String(g.ID_Nhom) === String(selectedGroupId)) || null;
  }, [groups, selectedGroupId]);

  return (
    <Layout>
      <Header>
        <div className='flex flex-col gap-1'>
          <h2 className='text-xl font-bold leading-6 text-grey-900'>Phân quyền</h2>
          <p className='text-sm text-grey-500'>Quản lý nhóm người dùng, chức năng và phân quyền hệ thống</p>
        </div>
      </Header>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
        <div className='p-4 bg-white border rounded-lg shadow-1 border-grey-transparent lg:col-span-3'>
          <div className='flex items-center justify-between'>
            <p className='font-semibold text-grey-900'>Nhóm người dùng</p>
          </div>

          {isLoading ? (
            <p className='mt-3 text-sm text-grey-500'>Đang tải...</p>
          ) : (
            <div className='flex flex-col gap-2 mt-3'>
              {groups.map((g) => (
                <button
                  key={g.ID_Nhom}
                  type='button'
                  onClick={() => setSelectedGroupId(g.ID_Nhom)}
                  className={`w-full text-left px-3 py-2 rounded-md border ${
                    String(selectedGroupId) === String(g.ID_Nhom)
                      ? 'border-primary bg-primary/5'
                      : 'border-grey-transparent hover:bg-grey-50'
                  }`}
                >
                  <p className='text-sm font-semibold text-grey-900'>{g.TenNhom}</p>
                  <p className='text-xs text-grey-500'>{g.MaNhom}</p>
                </button>
              ))}
            </div>
          )}

          <div className='mt-4 pt-4 border-t border-grey-transparent'>
            <p className='text-sm font-semibold text-grey-900'>Thêm nhóm</p>
            <div className='flex flex-col gap-2 mt-2'>
              <input
                value={groupForm.TenNhom}
                onChange={(e) => setGroupForm((p) => ({ ...p, TenNhom: e.target.value }))}
                className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                placeholder='Tên nhóm'
              />
              <input
                value={groupForm.MaNhom}
                onChange={(e) => setGroupForm((p) => ({ ...p, MaNhom: e.target.value }))}
                className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                placeholder='Mã nhóm (vd: doctors)'
              />
              <button
                type='button'
                onClick={() => createGroupMutation.mutate(groupForm)}
                disabled={createGroupMutation.isPending}
                className='px-3 py-2 text-sm font-semibold text-white rounded-md bg-primary disabled:opacity-60'
              >
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>

        <div className='p-4 bg-white border rounded-lg shadow-1 border-grey-transparent lg:col-span-4'>
          <p className='font-semibold text-grey-900'>Chức năng</p>
          <p className='mt-1 text-xs text-grey-500'>Danh sách chức năng dùng để gán phân quyền</p>

          {functionsQuery.isLoading ? (
            <p className='mt-3 text-sm text-grey-500'>Đang tải...</p>
          ) : (
            <div className='flex flex-col gap-2 mt-3 max-h-[420px] overflow-auto pr-1'>
              {functions.map((f) => (
                <div key={f.ID_ChucNang} className='px-3 py-2 border rounded-md border-grey-transparent'>
                  <p className='text-sm font-semibold text-grey-900'>{f.TenChucNang}</p>
                  <p className='text-xs text-grey-500'>{f.TenManHinhTuongUong}</p>
                </div>
              ))}
            </div>
          )}

          <div className='mt-4 pt-4 border-t border-grey-transparent'>
            <p className='text-sm font-semibold text-grey-900'>Thêm chức năng</p>
            <div className='flex flex-col gap-2 mt-2'>
              <input
                value={funcForm.TenChucNang}
                onChange={(e) => setFuncForm((p) => ({ ...p, TenChucNang: e.target.value }))}
                className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                placeholder='Tên chức năng'
              />
              <input
                value={funcForm.TenManHinhTuongUong}
                onChange={(e) => setFuncForm((p) => ({ ...p, TenManHinhTuongUong: e.target.value }))}
                className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                placeholder='Screen code (vd: manage-drugs)'
              />
              <button
                type='button'
                onClick={() => createFunctionMutation.mutate(funcForm)}
                disabled={createFunctionMutation.isPending}
                className='px-3 py-2 text-sm font-semibold text-white rounded-md bg-primary disabled:opacity-60'
              >
                Tạo chức năng
              </button>
            </div>
          </div>
        </div>

        <div className='p-4 bg-white border rounded-lg shadow-1 border-grey-transparent lg:col-span-5'>
          <p className='font-semibold text-grey-900'>Gán quyền</p>
          <p className='mt-1 text-xs text-grey-500'>Chọn nhóm, tick chức năng, sau đó lưu</p>

          {!hasSelectedGroup ? (
            <p className='mt-3 text-sm text-grey-500'>Chưa có nhóm để phân quyền.</p>
          ) : (
            <>
              <div className='flex items-center justify-between mt-3'>
                <div>
                  <p className='text-sm font-semibold text-grey-900'>{selectedGroup?.TenNhom}</p>
                  <p className='text-xs text-grey-500'>{selectedGroup?.MaNhom}</p>
                </div>
                <button
                  type='button'
                  onClick={() => assignPermissionsMutation.mutate({ idNhom: selectedGroupId, functionIds: selectedFunctionIds })}
                  disabled={assignPermissionsMutation.isPending || permissionsQuery.isLoading}
                  className='px-3 py-2 text-sm font-semibold text-white rounded-md bg-primary disabled:opacity-60'
                >
                  Lưu
                </button>
              </div>

              {permissionsQuery.isLoading ? (
                <p className='mt-3 text-sm text-grey-500'>Đang tải quyền...</p>
              ) : (
                <div className='mt-3 max-h-[520px] overflow-auto pr-1'>
                  <div className='flex flex-col gap-2'>
                    {functions.map((f) => {
                      const checked = selectedFunctionIds.includes(f.ID_ChucNang);
                      return (
                        <label
                          key={f.ID_ChucNang}
                          className='flex items-start gap-3 px-3 py-2 border rounded-md cursor-pointer border-grey-transparent hover:bg-grey-50'
                        >
                          <input
                            type='checkbox'
                            checked={checked}
                            onChange={() => toggleFunction(f.ID_ChucNang)}
                            className='mt-1'
                          />
                          <span>
                            <p className='text-sm font-semibold text-grey-900'>{f.TenChucNang}</p>
                            <p className='text-xs text-grey-500'>{f.TenManHinhTuongUong}</p>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Permissions;
