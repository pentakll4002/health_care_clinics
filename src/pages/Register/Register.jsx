import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import LayoutAuth from '../../layouts/LayoutAuth';
import FormRow from '../../ui/FormRow';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import ButtonSocial from '../../ui/ButtonSocial';
import CheckBox from '../../ui/CheckBox';
import useToggleValue from '../../hooks/useToggleValue';
import InputCaptcha from '../../pages/Register/InputCaptcha';
import InputOTP from '../../pages/Register/InputOTP';
import Spinner from '../../ui/Spinner';

import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

import logoFacebook from '../../assets/bi_facebook.png';
import logoGoogle from '../../assets/Google_Logo.png';
import logoApple from '../../assets/Apple_Logo.png';
import SignUpImg from '../../assets/register.png';
import axiosInstance from '../../utils/axiosInstance';

const schema = yup.object({
  name: yup.string().required('Vui lòng nhập tên tài khoản'),
  phone: yup.string().required('Vui lòng nhập số điện thoại'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Vui lòng nhập tên đăng nhập'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(8, 'Mật khẩu tối đa 8 kí tự'),
  confirmPassword: yup
    .string()
    .label('confirm password')
    .required('Vui lòng nhập mật khẩu')
    .oneOf([yup.ref('password'), null], 'Mật khẩu không khớp'),
});

const Register = () => {
  const { value: showPassword, handleToggleValue: handleSetShowPassword } =
    useToggleValue(false);
  const {
    value: showConfirmPassword,
    handleToggleValue: handleSetShowConfirmPassword,
  } = useToggleValue(false);
  const { value: checked, handleToggleValue: handleSetChecked } =
    useToggleValue(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [registerData, setRegisterData] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [captchaError, setCaptchaError] = useState(null);

  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  });

  async function onSubmit(data) {
    setLoading(true);
    setError(null);
    try {
      setRegisterData({
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
      });
      setStep(2);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xử lý đăng ký');
    } finally {
      setLoading(false);
    }
  }

  async function handleCaptchaSubmit(captchaValue, captchaText) {
    setLoading(true);
    setCaptchaError(null);
    try {
      if (captchaValue === captchaText) {
        await axiosInstance.post('/register', {
          name: registerData.name,
          phone: registerData.phone,
          email: registerData.email,
          password: registerData.password,
        });
        setStep(3);
      } else {
        throw new Error('Mã CAPTCHA không đúng');
      }
    } catch (err) {
      setCaptchaError(
        err.response?.data?.message ||
          err.message ||
          'Xác thực CAPTCHA thất bại'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOTPSubmit(otp) {
    setLoading(true);
    setOtpError(null);
    try {
      await axiosInstance.post('/register/verify-otp', {
        email: registerData.email,
        otp,
      });
      alert('Đăng ký xác thực thành công!');
      navigate('/sign-in');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LayoutAuth heading='Đăng ký tài khoản BỆNH NHÂN' picture={SignUpImg}>
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

      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmit)}>
          {error && <p className='mb-4 text-center text-red-500'>{error}</p>}

          <FormRow label='Full name' name='name' error={errors.name?.message}>
            <Input
              control={control}
              name='name'
              type='name'
              placeholder='Enter name'
              icon={<UserIcon />}
            />
          </FormRow>

          <FormRow label='Phone' name='phone' error={errors.phone?.message}>
            <Input
              control={control}
              name='phone'
              type='tel'
              placeholder='Enter phone number'
            />
          </FormRow>

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
              icon={<EnvelopeIcon />}
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

          <FormRow
            label='Confirm password'
            name='confirmPassword'
            error={errors.confirmPassword?.message}
          >
            <Input
              control={control}
              name='confirmPassword'
              type={!showConfirmPassword ? 'password' : 'string'}
              placeholder='************'
              icon={<LockClosedIcon />}
            >
              {!showConfirmPassword ? (
                <EyeSlashIcon
                  className='w-6 h-6'
                  onClick={handleSetShowConfirmPassword}
                />
              ) : (
                <EyeIcon
                  className='w-6 h-6'
                  onClick={handleSetShowConfirmPassword}
                />
              )}
            </Input>
          </FormRow>

          <CheckBox className='mb-5' name='term' onClick={handleSetChecked} checked={checked}>
            I agree to the{' '}
            <Link className='underline text-primary'>
              Terms of Service & Privacy Policy
            </Link>
          </CheckBox>

          <Button
            type='submit'
            className='w-full text-white bg-primary'
            disabled={loading}
            isLoading={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className='max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg border'>
          <h2 className='text-xl font-semibold text-center mb-4 text-gray-800'>
            Xác thực Captcha
          </h2>
          <p className='text-center text-gray-600 mb-6'>
            Vui lòng nhập mã captcha để tiếp tục đăng ký.
          </p>
          {captchaError && (
            <p className='mb-4 text-center text-red-500 bg-red-50 p-2 rounded'>
              {captchaError}
            </p>
          )}
          <div className='flex justify-center mb-4'>
            <InputCaptcha onCaptchaSubmit={handleCaptchaSubmit} />
          </div>
          <Button
            type='button'
            disabled={loading}
            onClick={() => setStep(1)}
            className='w-full bg-gray-500 hover:bg-gray-600 text-white'
          >
            Nhập lại thông tin
          </Button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className='mb-4 text-center text-green-500'>
            Mã OTP đã gửi vào email {registerData.email}. Vui lòng nhập mã để xác
            nhận đăng ký.
          </p>
          {otpError && (
            <p className='mb-4 text-center text-red-500'>{otpError}</p>
          )}
          <InputOTP length={6} onOTPSubmit={handleOTPSubmit} />
          <Button
            type='button'
            disabled={loading}
            onClick={() => setStep(1)}
            className='w-full mt-4'
          >
            Nhập lại thông tin
          </Button>
        </div>
      )}
    </LayoutAuth>
  );
};

export default Register;
