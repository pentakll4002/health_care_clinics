import styled from 'styled-components';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

function Catalogs() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('loai-benh');

  const [loaiBenhForm, setLoaiBenhForm] = useState({ tenLoaiBenh: '', trieuChung: '', huongDieuTri: '' });
  const [dvtForm, setDvtForm] = useState({ tenDvt: '' });
  const [cachDungForm, setCachDungForm] = useState({ moTaCachDung: '' });

  const [editingLoaiBenh, setEditingLoaiBenh] = useState(null);
  const [editingDvt, setEditingDvt] = useState(null);
  const [editingCachDung, setEditingCachDung] = useState(null);

  const loaiBenhQuery = useQuery({
    queryKey: ['catalogs', 'loai-benh'],
    queryFn: async () => {
      const res = await axiosInstance.get('/loai-benh');
      return res.data;
    },
  });

  const dvtQuery = useQuery({
    queryKey: ['catalogs', 'dvt'],
    queryFn: async () => {
      const res = await axiosInstance.get('/dvt');
      return res.data;
    },
  });

  const cachDungQuery = useQuery({
    queryKey: ['catalogs', 'cach-dung'],
    queryFn: async () => {
      const res = await axiosInstance.get('/cach-dung');
      return res.data;
    },
  });

  const loaiBenhList = useMemo(() => loaiBenhQuery.data?.data || [], [loaiBenhQuery.data]);
  const dvtList = useMemo(() => dvtQuery.data?.data || dvtQuery.data || [], [dvtQuery.data]);
  const cachDungList = useMemo(() => cachDungQuery.data?.data || cachDungQuery.data || [], [cachDungQuery.data]);

  const createLoaiBenhMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post('/loai-benh', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Tạo loại bệnh thành công');
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'loai-benh'] });
      setLoaiBenhForm({ tenLoaiBenh: '', trieuChung: '', huongDieuTri: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo loại bệnh thất bại');
    },
  });

  const updateLoaiBenhMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.put(`/loai-benh/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật loại bệnh thành công');
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'loai-benh'] });
      setEditingLoaiBenh(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật loại bệnh thất bại');
    },
  });

  const deleteLoaiBenhMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/loai-benh/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Xóa loại bệnh thành công');
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'loai-benh'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa loại bệnh thất bại');
    },
  });

  const createDvtMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post('/dvt', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Tạo đơn vị tính thành công');
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'dvt'] });
      setDvtForm({ tenDvt: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo đơn vị tính thất bại');
    },
  });

  const updateDvtMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.put(`/dvt/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật đơn vị tính thành công');
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'dvt'] });
      setEditingDvt(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật đơn vị tính thất bại');
    },
  });

  const deleteDvtMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/dvt/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Xóa đơn vị tính thành công');
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'dvt'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa đơn vị tính thất bại');
    },
  });

  const createCachDungMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post('/cach-dung', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Tạo cách dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'cach-dung'] });
      setCachDungForm({ moTaCachDung: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo cách dùng thất bại');
    },
  });

  const updateCachDungMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.put(`/cach-dung/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật cách dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'cach-dung'] });
      setEditingCachDung(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật cách dùng thất bại');
    },
  });

  const deleteCachDungMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/cach-dung/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Xóa cách dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'cach-dung'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa cách dùng thất bại');
    },
  });

  return (
    <Layout>
      <Header>
        <div className='flex flex-col gap-1'>
          <h2 className='text-xl font-bold leading-6 text-grey-900'>Danh mục nền</h2>
          <p className='text-sm text-grey-500'>Quản lý dữ liệu danh mục dùng chung trong hệ thống</p>
        </div>
      </Header>

      <div className='p-4 bg-white border rounded-lg shadow-1 border-grey-transparent'>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => setTab('loai-benh')}
            className={`px-3 py-2 text-sm font-semibold rounded-md border ${
              tab === 'loai-benh' ? 'border-primary bg-primary/5' : 'border-grey-transparent hover:bg-grey-50'
            }`}
          >
            Loại bệnh
          </button>
          <button
            type='button'
            onClick={() => setTab('dvt')}
            className={`px-3 py-2 text-sm font-semibold rounded-md border ${
              tab === 'dvt' ? 'border-primary bg-primary/5' : 'border-grey-transparent hover:bg-grey-50'
            }`}
          >
            Đơn vị tính
          </button>
          <button
            type='button'
            onClick={() => setTab('cach-dung')}
            className={`px-3 py-2 text-sm font-semibold rounded-md border ${
              tab === 'cach-dung' ? 'border-primary bg-primary/5' : 'border-grey-transparent hover:bg-grey-50'
            }`}
          >
            Cách dùng
          </button>
        </div>

        {tab === 'loai-benh' && (
          <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12'>
            <div className='lg:col-span-4'>
              <p className='text-sm font-semibold text-grey-900'>Thêm loại bệnh</p>
              <div className='flex flex-col gap-2 mt-2'>
                <input
                  value={loaiBenhForm.tenLoaiBenh}
                  onChange={(e) => setLoaiBenhForm((p) => ({ ...p, tenLoaiBenh: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                  placeholder='Tên loại bệnh'
                />
                <input
                  value={loaiBenhForm.trieuChung}
                  onChange={(e) => setLoaiBenhForm((p) => ({ ...p, trieuChung: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                  placeholder='Triệu chứng'
                />
                <input
                  value={loaiBenhForm.huongDieuTri}
                  onChange={(e) => setLoaiBenhForm((p) => ({ ...p, huongDieuTri: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                  placeholder='Hướng điều trị'
                />
                <button
                  type='button'
                  onClick={() => createLoaiBenhMutation.mutate(loaiBenhForm)}
                  disabled={createLoaiBenhMutation.isPending}
                  className='px-3 py-2 text-sm font-semibold text-white rounded-md bg-primary disabled:opacity-60'
                >
                  Tạo
                </button>
              </div>
            </div>

            <div className='lg:col-span-8'>
              <p className='text-sm font-semibold text-grey-900'>Danh sách</p>
              {loaiBenhQuery.isLoading ? (
                <p className='mt-2 text-sm text-grey-500'>Đang tải...</p>
              ) : (
                <div className='mt-2 flex flex-col gap-2'>
                  {loaiBenhList.filter(item => item).map((item) => {
                    const isEditing = editingLoaiBenh?.ID_LoaiBenh === item.ID_LoaiBenh;
                    return (
                      <div key={item.ID_LoaiBenh} className='p-3 border rounded-md border-grey-transparent'>
                        {isEditing ? (
                          <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
                            <input
                              value={editingLoaiBenh.tenLoaiBenh}
                              onChange={(e) => setEditingLoaiBenh((p) => ({ ...p, tenLoaiBenh: e.target.value }))}
                              className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                            />
                            <input
                              value={editingLoaiBenh.trieuChung || ''}
                              onChange={(e) => setEditingLoaiBenh((p) => ({ ...p, trieuChung: e.target.value }))}
                              className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                            />
                            <input
                              value={editingLoaiBenh.huongDieuTri || ''}
                              onChange={(e) => setEditingLoaiBenh((p) => ({ ...p, huongDieuTri: e.target.value }))}
                              className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                            />
                          </div>
                        ) : (
                          <div>
                            <p className='text-sm font-semibold text-grey-900'>{item.tenLoaiBenh}</p>
                            <p className='text-xs text-grey-500'>{item.trieuChung || '-'}</p>
                            <p className='text-xs text-grey-500'>{item.huongDieuTri || '-'}</p>
                          </div>
                        )}

                        <div className='flex items-center justify-end gap-2 mt-3'>
                          {isEditing ? (
                            <>
                              <button
                                type='button'
                                onClick={() =>
                                  updateLoaiBenhMutation.mutate({
                                    id: item.ID_LoaiBenh,
                                    payload: {
                                      tenLoaiBenh: editingLoaiBenh.tenLoaiBenh,
                                      trieuChung: editingLoaiBenh.trieuChung,
                                      huongDieuTri: editingLoaiBenh.huongDieuTri,
                                    },
                                  })
                                }
                                disabled={updateLoaiBenhMutation.isPending}
                                className='px-3 py-2 text-sm font-semibold text-white rounded-md bg-primary disabled:opacity-60'
                              >
                                Lưu
                              </button>
                              <button
                                type='button'
                                onClick={() => setEditingLoaiBenh(null)}
                                className='px-3 py-2 text-sm font-semibold border rounded-md border-grey-transparent'
                              >
                                Huỷ
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type='button'
                                onClick={() => setEditingLoaiBenh({ ...item })}
                                className='px-3 py-2 text-sm font-semibold border rounded-md border-grey-transparent'
                              >
                                Sửa
                              </button>
                              <button
                                type='button'
                                onClick={() => deleteLoaiBenhMutation.mutate(item.ID_LoaiBenh)}
                                disabled={deleteLoaiBenhMutation.isPending}
                                className='px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-md disabled:opacity-60'
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'dvt' && (
          <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12'>
            <div className='lg:col-span-4'>
              <p className='text-sm font-semibold text-grey-900'>Thêm đơn vị tính</p>
              <div className='flex flex-col gap-2 mt-2'>
                <input
                  value={dvtForm.tenDvt}
                  onChange={(e) => setDvtForm({ tenDvt: e.target.value })}
                  className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                  placeholder='Tên đơn vị tính'
                />
                <button
                  type='button'
                  onClick={() => createDvtMutation.mutate(dvtForm)}
                  disabled={createDvtMutation.isPending}
                  className='px-3 py-2 text-sm font-semibold text-white rounded-md bg-primary disabled:opacity-60'
                >
                  Tạo
                </button>
              </div>
            </div>

            <div className='lg:col-span-8'>
              <p className='text-sm font-semibold text-grey-900'>Danh sách</p>
              {dvtQuery.isLoading ? (
                <p className='mt-2 text-sm text-grey-500'>Đang tải...</p>
              ) : (
                <div className='mt-2 flex flex-col gap-2'>
                  {dvtList.filter(item => item).map((item) => {
                    const isEditing = editingDvt?.ID_DVT === item.ID_DVT;
                    return (
                      <div key={item.ID_DVT} className='p-3 border rounded-md border-grey-transparent'>
                        {isEditing && editingDvt ? (
                          <input
                            value={editingDvt.tenDvt}
                            onChange={(e) => setEditingDvt((p) => ({ ...p, tenDvt: e.target.value }))}
                            className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                          />
                        ) : (
                          <p className='text-sm font-semibold text-grey-900'>{item.tenDvt}</p>
                        )}
                        <div className='flex items-center justify-end gap-2 mt-3'>
                          {isEditing ? (
                            <>
                              <button
                                type='button'
                                onClick={() => updateDvtMutation.mutate({ id: item.ID_DVT, payload: { tenDvt: editingDvt?.tenDvt || '' } })}
                                disabled={updateDvtMutation.isPending}
                                className='px-3 py-2 text-sm font-semibold text-white rounded-md bg-primary disabled:opacity-60'
                              >
                                Lưu
                              </button>
                              <button
                                type='button'
                                onClick={() => setEditingDvt(null)}
                                className='px-3 py-2 text-sm font-semibold border rounded-md border-grey-transparent'
                              >
                                Huỷ
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type='button'
                                onClick={() => setEditingDvt({ ...item })}
                                className='px-3 py-2 text-sm font-semibold border rounded-md border-grey-transparent'
                              >
                                Sửa
                              </button>
                              <button
                                type='button'
                                onClick={() => deleteDvtMutation.mutate(item.ID_DVT)}
                                disabled={deleteDvtMutation.isPending}
                                className='px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-md disabled:opacity-60'
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'cach-dung' && (
          <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12'>
            <div className='lg:col-span-4'>
              <p className='text-sm font-semibold text-grey-900'>Thêm cách dùng</p>
              <div className='flex flex-col gap-2 mt-2'>
                <input
                  value={cachDungForm.moTaCachDung}
                  onChange={(e) => setCachDungForm({ moTaCachDung: e.target.value })}
                  className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                  placeholder='Mô tả cách dùng'
                />
                <button
                  type='button'
                  onClick={() => createCachDungMutation.mutate(cachDungForm)}
                  disabled={createCachDungMutation.isPending}
                  className='px-3 py-2 text-sm font-semibold text-white rounded-md bg-primary disabled:opacity-60'
                >
                  Tạo
                </button>
              </div>
            </div>

            <div className='lg:col-span-8'>
              <p className='text-sm font-semibold text-grey-900'>Danh sách</p>
              {cachDungQuery.isLoading ? (
                <p className='mt-2 text-sm text-grey-500'>Đang tải...</p>
              ) : (
                <div className='mt-2 flex flex-col gap-2'>
                  {cachDungList.filter(item => item).map((item) => {
                    const isEditing = editingCachDung?.ID_CachDung === item.ID_CachDung;
                    return (
                      <div key={item.ID_CachDung} className='p-3 border rounded-md border-grey-transparent'>
                        {isEditing && editingCachDung ? (
                          <input
                            value={editingCachDung.moTaCachDung}
                            onChange={(e) => setEditingCachDung((p) => ({ ...p, moTaCachDung: e.target.value }))}
                            className='w-full px-3 py-2 text-sm border rounded-md border-grey-transparent'
                          />
                        ) : (
                          <p className='text-sm font-semibold text-grey-900'>{item.moTaCachDung}</p>
                        )}
                        <div className='flex items-center justify-end gap-2 mt-3'>
                          {isEditing ? (
                            <>
                              <button
                                type='button'
                                onClick={() =>
                                  updateCachDungMutation.mutate({
                                    id: item.ID_CachDung,
                                    payload: { moTaCachDung: editingCachDung?.moTaCachDung || '' },
                                  })
                                }
                                disabled={updateCachDungMutation.isPending}
                                className='px-3 py-2 text-sm font-semibold text-white rounded-md bg-primary disabled:opacity-60'
                              >
                                Lưu
                              </button>
                              <button
                                type='button'
                                onClick={() => setEditingCachDung(null)}
                                className='px-3 py-2 text-sm font-semibold border rounded-md border-grey-transparent'
                              >
                                Huỷ
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type='button'
                                onClick={() => setEditingCachDung({ ...item })}
                                className='px-3 py-2 text-sm font-semibold border rounded-md border-grey-transparent'
                              >
                                Sửa
                              </button>
                              <button
                                type='button'
                                onClick={() => deleteCachDungMutation.mutate(item.ID_CachDung)}
                                disabled={deleteCachDungMutation.isPending}
                                className='px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-md disabled:opacity-60'
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Catalogs;
