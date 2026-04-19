import axios from 'axios'
import { useFormik } from 'formik'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { LoginFormValues } from '../common/types'
import { useUser } from '../UserContext'
import { API_BASE_URL } from '../common/api'
import { setSecureToken } from '../common/secureStorage'

type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>

function LoginPage() {
	const [showPassword, setShowPassword] = useState(false)
	const navigate = useNavigate()
	const { refreshMe } = useUser()

	const formik = useFormik<LoginFormValues>({
		initialValues: {
			email: '',
			password: '',
		},
		validate: (values) => {
			const errors: LoginFormErrors = {}

			if (!values.email.trim()) {
				errors.email = 'Email is required.'
			} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
				errors.email = 'Enter a valid email address.'
			}

			if (!values.password) {
				errors.password = 'Password is required.'
			}

			return errors
		},
		onSubmit: async (values, helpers) => {
			helpers.setStatus(undefined)

			try {
				const { data } = await axios.post<{ token: string }>(`${API_BASE_URL}/api/auth/login`, {
					email: values.email,
					password: values.password,
				})

				setSecureToken(data.token)
				await refreshMe()
				helpers.resetForm()
				navigate('/')
			} catch (error) {
				if (axios.isAxiosError(error)) {
					helpers.setStatus({
						type: 'error',
						message:
							error.response?.data && typeof error.response.data === 'string'
								? error.response.data
								: 'Login failed. Please check your credentials.',
					})
					return
				}

				helpers.setStatus({
					type: 'error',
					message: 'Something went wrong. Please try again.',
				})
			}
		},
	})

	return (
		<div className='flex min-h-screen items-center justify-center bg-[#fd79a8] px-6 py-10'>
			<div className='mx-auto flex w-full max-w-3xl flex-col items-center gap-8'>
				<h1 className='text-center text-4xl font-extrabold tracking-tight text-white md:text-6xl'>
					Login
				</h1>

				<div className='w-full rounded-2xl bg-white p-6 shadow-2xl md:p-8'>
					<form className='space-y-4' onSubmit={formik.handleSubmit} autoComplete='off'>
						<div>
							<label className='mb-1 block text-sm font-semibold text-slate-800' htmlFor='email'>
								Email
							</label>
							<input
								id='email'
								name='email'
								type='email'
								placeholder='john.doe@email.com'
								autoComplete='email'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.email}
								className='w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200'
							/>
							{formik.touched.email && formik.errors.email ? (
								<p className='mt-1 text-sm text-red-600'>{formik.errors.email}</p>
							) : null}
						</div>

						<div>
							<label className='mb-1 block text-sm font-semibold text-slate-800' htmlFor='password'>
								Password
							</label>
							<div className='relative'>
								<input
									id='password'
									name='password'
									type={showPassword ? 'text' : 'password'}
									placeholder='*********'
									autoComplete='current-password'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.password}
									className='w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-16 text-slate-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200'
								/>
								<button
									type='button'
									onClick={() => setShowPassword((prev) => !prev)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900'
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
								</button>
							</div>
							{formik.touched.password && formik.errors.password ? (
								<p className='mt-1 text-sm text-red-600'>{formik.errors.password}</p>
							) : null}
						</div>

						{formik.status?.message ? (
							<p className='text-center text-sm text-red-600'>{formik.status.message}</p>
						) : null}

						<button
							type='submit'
							disabled={formik.isSubmitting}
							className='w-full rounded-lg bg-[#e84393] px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70'
						>
							{formik.isSubmitting ? 'Signing in...' : 'Sign In'}
						</button>

						<p className='text-center text-sm text-slate-600'>
							No account yet?{' '}
							<Link className='font-semibold text-pink-600 hover:text-pink-700' to='/register'>
								Register
							</Link>
						</p>
					</form>
				</div>
			</div>
		</div>
	)
}

export default LoginPage
