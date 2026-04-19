import axios from 'axios'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/navbar'
import { API_BASE_URL } from '../common/api'
import { FEEDBACK_CATEGORIES } from '../common/feedback-categories'
import { getSecureToken } from '../common/secureStorage'
import type { UserFeedbackFormValues } from '../common/types'
const IMPROVEMENT_AREA_OPTIONS = ['Usability', 'Features', 'Speed']

const INITIAL_FORM: UserFeedbackFormValues = {
    category: FEEDBACK_CATEGORIES[0],
    rating: 5,
    contactConsent: false,
    comments: '',
    improvementAreas: ['Usability'],
}

function FeedbackPage() {
    const navigate = useNavigate()
    const [formValues, setFormValues] = useState<UserFeedbackFormValues>(INITIAL_FORM)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const authHeaders = useMemo(() => {
        const token = getSecureToken()
        return token ? { Authorization: `Bearer ${token}` } : null
    }, [])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return
        }

        if (!formValues.comments.trim()) {
            setErrorMessage('Please add your feedback details in the text box.')
            return
        }

        if (formValues.improvementAreas.length === 0) {
            setErrorMessage('Please select at least one improvement area.')
            return
        }

        setLoading(true)
        setErrorMessage(null)

        try {
            await axios.post(
                `${API_BASE_URL}/api/feedbacks/create`,
                {
                    category: `${formValues.category} - ${formValues.improvementAreas.join(', ')}`,
                    rating: formValues.rating,
                    contactConsent: formValues.contactConsent,
                    comments: formValues.comments.trim(),
                },
                { headers: authHeaders },
            )

            navigate('/jobs')
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(
                    error.response?.data && typeof error.response.data === 'string'
                        ? error.response.data
                        : 'Failed to send feedback.',
                )
            } else {
                setErrorMessage('Failed to send feedback.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#fd79a8]'>
            <Navbar />

            <main className='mx-auto w-full max-w-3xl px-4 pb-10 pt-6'>
                <h1 className='mb-6 text-center text-3xl font-extrabold tracking-tight text-white md:text-5xl'>Send Feedback</h1>

                {errorMessage ? <p className='mb-4 text-center text-sm font-semibold text-red-100'>{errorMessage}</p> : null}

                <form onSubmit={handleSubmit} className='space-y-5 rounded-2xl border border-white/30 bg-white/95 p-6 shadow-xl'>
                    <label className='block text-sm font-semibold text-slate-700'>
                        Category
                        <select
                            value={formValues.category}
                            onChange={(event) => setFormValues((prev) => ({ ...prev, category: event.target.value }))}
                            className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                        >
                            {FEEDBACK_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>

                    <fieldset>
                        <legend className='text-sm font-semibold text-slate-700'>Improvement Area (select multiple)</legend>
                        <div className='mt-2 flex flex-wrap gap-4'>
                            {IMPROVEMENT_AREA_OPTIONS.map((option) => (
                                <label key={option} className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
                                    <input
                                        type='checkbox'
                                        checked={formValues.improvementAreas.includes(option)}
                                        onChange={(event) => {
                                            setFormValues((prev) => ({
                                                ...prev,
                                                improvementAreas: event.target.checked
                                                    ? [...prev.improvementAreas, option]
                                                    : prev.improvementAreas.filter((item) => item !== option),
                                            }))
                                        }}
                                        className='h-4 w-4 accent-[#a29bfe]'
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend className='text-sm font-semibold text-slate-700'>Overall Rating</legend>
                        <div className='mt-2 flex flex-wrap gap-3'>
                            {[1, 2, 3, 4, 5].map((value) => (
                                <label key={value} className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
                                    <input
                                        type='radio'
                                        name='rating'
                                        value={value}
                                        checked={formValues.rating === value}
                                        onChange={() => setFormValues((prev) => ({ ...prev, rating: value }))}
                                        className='h-4 w-4 accent-[#a29bfe]'
                                    />
                                    {value}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <label className='inline-flex items-center gap-2 text-sm font-semibold text-slate-700'>
                        <input
                            type='checkbox'
                            checked={formValues.contactConsent}
                            onChange={(event) => setFormValues((prev) => ({ ...prev, contactConsent: event.target.checked }))}
                            className='h-4 w-4 rounded border-slate-300 accent-[#a29bfe]'
                        />
                        I agree to be contacted about this feedback
                    </label>

                    <label className='block text-sm font-semibold text-slate-700'>
                        Feedback Details
                        <textarea
                            rows={5}
                            value={formValues.comments}
                            onChange={(event) => setFormValues((prev) => ({ ...prev, comments: event.target.value }))}
                            placeholder='Tell us what works well and what we should improve...'
                            className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                        />
                    </label>

                    <div className='flex justify-end'>
                        <button
                            type='submit'
                            disabled={loading}
                            className='rounded-md bg-[#a29bfe] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8f86f8] disabled:opacity-60'
                        >
                            {loading ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default FeedbackPage
