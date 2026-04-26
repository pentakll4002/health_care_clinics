import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import LayoutAuth from '../../layouts/LayoutAuth';
import SignInImg from '../../assets/sign-in.png';
import FormRow from '../../ui/FormRow';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import CheckBox from '../../ui/CheckBox';
import ButtonSocial from '../../ui/ButtonSocial';
import Spinner from '../../ui/Spinner';

import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import logoFacebook from '../../assets/bi_facebook.png';
import logoGoogle from '../../assets/Google_Logo.png';
import logoApple from '../../assets/Apple_Logo.png';
import useToggleValue from '../../hooks/useToggleValue';
import axiosInstance from '../../utils/axiosInstance';

const schema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Vui lòng nhập tên đăng nhập'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(8, 'Mật khẩu ít nhất 8 kí tự'),
});


const SignIn = () => {
  const { value: showPassword, handleToggleValue: handleSetShowPassword } =
    useToggleValue(false);
  const { value: checked, handleToggleValue: handleSetChecked } =
    useToggleValue(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/login', data);
      const { token, userId, name, email, role } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id: userId, name, email, role }));

      // Let RoleLanding handle the correct redirection based on the user's role
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutAuth
      heading='Sign In'
      paragraph='Please enter below details to access the dashboard'
      picture={SignInImg}
    >
      {loading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner />
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && <p className='mb-4 text-center text-red-500'>{error}</p>}
        <FormRow
          label='Email Address'
          name='email'
          error={errors.email?.message}
        >
          <Input
            control={control}
            name='email'
            type='email'
            placeholder='Enter Email Address'
            icon={<UserIcon />}
          />
        </FormRow>

        <FormRow
          label='Password'
          name='password'
          error={errors.password?.message}
        >
          <Input
            control={control}
            name='password'
            type={!showPassword ? 'password' : 'string'}
            placeholder='************'
            icon={<LockClosedIcon />}
          >
            {!showPassword ? (
              <EyeSlashIcon
                className='w-6 h-6'
                onClick={handleSetShowPassword}
              />
            ) : (
              <EyeIcon className='w-6 h-6' onClick={handleSetShowPassword} />
            )}
          </Input>
        </FormRow>

        <div className='flex justify-between items-center mb-5'>
          <CheckBox name='term' onClick={handleSetChecked} checked={checked}>
            Remember Me
          </CheckBox>
          <Link
            to='/forgot-password'
            className='text-sm font-normal text-error hover:underline'
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type='submit'
          className='w-full text-white bg-primary'
          disabled={loading}
          isLoading={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <div className='h-[20px] w-full flex items-center justify-between my-5'>
          <div className='h-[1px] bg-grey-transparent w-[165px]'></div>
          <p className='text-grey-500 text-[13px]'>OR</p>
          <div className='h-[1px] bg-grey-transparent w-[165px]'></div>
        </div>

        <div className='flex flex-col gap-y-5'>
          <div className='flex items-center justify-between'>
            <ButtonSocial ImgSocial={logoFacebook}></ButtonSocial>
            <ButtonSocial ImgSocial={logoGoogle}></ButtonSocial>
            <ButtonSocial ImgSocial={logoApple}></ButtonSocial>
          </div>
          <p className='text-sm font-normal text-center text-grey-900'>
            Don’t have an account yet?{' '}
            <Link to='/sign-up' className=' text-primary hover:underline'>
              Register
            </Link>
          </p>
        </div>
      </form>
    </LayoutAuth>
  );
};

export default SignIn;
