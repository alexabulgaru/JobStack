import axios from 'axios'
import { useFormik } from 'formik'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { RegisterFormValues } from '../common/types'
import { API_BASE_URL } from '../common/api'

type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>

function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const navigate = useNavigate()

	const formik = useFormik<RegisterFormValues>({
		initialValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
		validate: (values) => {
			const errors: RegisterFormErrors = {}
			const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

			if (!values.firstName.trim()) {
				errors.firstName = 'First name is required.'
			}

			if (!values.lastName.trim()) {
				errors.lastName = 'Last name is required.'
			}

			if (!values.email.trim()) {
				errors.email = 'Email is required.'
			} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
				errors.email = 'Enter a valid email address.'
			}

			if (!values.password) {
				errors.password = 'Password is required.'
			} else if (!strongPasswordRegex.test(values.password)) {
				errors.password =
					'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
			}

			if (!values.confirmPassword) {
				errors.confirmPassword = 'Please confirm your password.'
			} else if (values.confirmPassword !== values.password) {
				errors.confirmPassword = 'Passwords do not match.'
			}

			return errors
		},
		onSubmit: async (values, helpers) => {
			helpers.setStatus(undefined)
			const { confirmPassword, ...payload } = values

			try {
				await axios.post<string>(`${API_BASE_URL}/api/auth/register`, payload)
				helpers.resetForm()
				navigate('/login')
			} catch (error) {
				if (axios.isAxiosError(error)) {
					helpers.setStatus({
						type: 'error',
						message:
							error.response?.data && typeof error.response.data === 'string'
								? error.response.data
								: 'Registration failed. Please try again.',
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
					Register
				</h1>

				<div className='w-full rounded-2xl bg-white p-6 shadow-2xl md:p-8'>
					<form className='space-y-4' onSubmit={formik.handleSubmit} autoComplete='off'>
						<div>
							<label className='mb-1 block text-sm font-semibold text-slate-800' htmlFor='firstName'>
								First Name
							</label>
							<input
								id='firstName'
								name='firstName'
								type='text'
									placeholder='John'
								autoComplete='given-name'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.firstName}
								className='w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200'
							/>
							{formik.touched.firstName && formik.errors.firstName ? (
								<p className='mt-1 text-sm text-red-600'>{formik.errors.firstName}</p>
							) : null}
						</div>

						<div>
							<label className='mb-1 block text-sm font-semibold text-slate-800' htmlFor='lastName'>
								Last Name
							</label>
							<input
								id='lastName'
								name='lastName'
								type='text'
									placeholder='Doe'
								autoComplete='family-name'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.lastName}
								className='w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200'
							/>
							{formik.touched.lastName && formik.errors.lastName ? (
								<p className='mt-1 text-sm text-red-600'>{formik.errors.lastName}</p>
							) : null}
						</div>

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
									autoComplete='new-password'
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
							) : (
								<p className='mt-1 text-xs text-slate-500'>
									Use 8+ characters with uppercase, lowercase, number, and symbol.
								</p>
							)}
						</div>

						<div>
							<label
								className='mb-1 block text-sm font-semibold text-slate-800'
								htmlFor='confirmPassword'
							>
								Confirm Password
							</label>
							<div className='relative'>
								<input
									id='confirmPassword'
									name='confirmPassword'
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder='*********'
									autoComplete='new-password'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.confirmPassword}
									className='w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-16 text-slate-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200'
								/>
								<button
									type='button'
									onClick={() => setShowConfirmPassword((prev) => !prev)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900'
									aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
								>
									{showConfirmPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
								</button>
							</div>
							{formik.touched.confirmPassword && formik.errors.confirmPassword ? (
								<p className='mt-1 text-sm text-red-600'>{formik.errors.confirmPassword}</p>
							) : null}
						</div>

						{formik.status?.message ? (
							<p
								className={`text-center text-sm ${
									formik.status.type === 'success' ? 'text-emerald-600' : 'text-red-600'
								}`}
							>
								{formik.status.message}
							</p>
						) : null}

						<button
							type='submit'
							disabled={formik.isSubmitting}
							className='w-full rounded-lg bg-[#e84393] px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70'
						>
							{formik.isSubmitting ? 'Creating account...' : 'Create Account'}
						</button>

						<p className='text-center text-sm text-slate-600'>
							Already have an account?{' '}
							<Link className='font-semibold text-pink-600 hover:text-pink-700' to='/login'>
								Login
							</Link>
						</p>
					</form>
				</div>
			</div>
		</div>
	)
}

export default RegisterPage
