import { ErrorMessage, Field, Form, Formik } from 'formik'
import type { FormModalProps } from '../common/types'

function FormModal({
    isOpen,
    title,
    description,
    submitLabel,
    initialValues,
    fields,
    onClose,
    onSubmit,
    validate,
}: FormModalProps) {
    if (!isOpen) {
        return null
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4'>
            <div className='w-full max-w-md rounded-2xl border border-white/30 bg-white p-6 shadow-2xl'>
                <div className='mb-4 flex items-start justify-between gap-4'>
                    <div>
                        <h2 className='text-xl font-extrabold text-[#fd79a8]'>{title}</h2>
                        {description ? <p className='mt-1 text-sm text-slate-600'>{description}</p> : null}
                    </div>

                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-md px-2 py-1 text-xs font-bold text-[#fd79a8] hover:bg-pink-50'
                        aria-label='Close modal'
                    >
                        x
                    </button>
                </div>

                <Formik initialValues={initialValues} validate={validate} onSubmit={onSubmit}>
                    {({ isSubmitting }) => (
                        <Form className='space-y-4'>
                            {fields.map((field) => (
                                <div key={field.name}>
                                    <label htmlFor={field.name} className='mb-1 block text-sm font-semibold text-slate-700'>
                                        {field.label}
                                    </label>
                                    {field.type === 'select' ? (
                                        <Field
                                            as='select'
                                            id={field.name}
                                            name={field.name}
                                            className='w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/35'
                                        >
                                            {(field.options ?? []).map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Field>
                                    ) : (
                                        <Field
                                            id={field.name}
                                            name={field.name}
                                            type={field.type ?? 'text'}
                                            placeholder={field.placeholder ?? ''}
                                            className='w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/35'
                                        />
                                    )}
                                    <ErrorMessage name={field.name} component='p' className='mt-1 text-xs font-semibold text-red-500' />
                                </div>
                            ))}

                            <div className='flex items-center justify-end gap-2 pt-2'>
                                <button
                                    type='button'
                                    onClick={onClose}
                                    className='rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='rounded-lg bg-gradient-to-r from-[#fd79a8] to-[#f66aa0] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:from-[#f66aa0] hover:to-[#ee5f97] disabled:opacity-60'
                                >
                                    {submitLabel}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}

export default FormModal
