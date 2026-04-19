import { useNavigate } from 'react-router-dom'
import { useUser } from '../UserContext'
import { clearSecureToken } from '../common/secureStorage'

function Navbar() {
    const navigate = useNavigate()
    const { user, clearUser } = useUser()
    const isUser = (user?.roles ?? []).some(
        (role) => typeof role === 'string' && role.toUpperCase().includes('USER'),
    )
    const isAdmin = (user?.roles ?? []).some(
        (role) => typeof role === 'string' && role.toUpperCase().includes('ADMIN'),
    )

    const adminActions = [
        { label: 'Users', path: '/users' },
        { label: 'Roles', path: '/roles' },
        { label: 'Tags', path: '/tags' },
        { label: 'Statuses', path: '/statuses' },
        { label: 'Feedbacks', path: '/feedbacks' },
    ]

    const userActions = [
        { label: 'Jobs', path: '/jobs' },
        { label: 'Evolution', path: '/evolution' },
        { label: 'Feedback', path: '/feedback' },
    ]

    const actionButtonClass =
        'before:ease relative overflow-hidden border border-white/40 px-8 py-2 text-white shadow-base transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-white/70 hover:before:-translate-x-40'

    const handleAuthButtonClick = () => {
        if (!user) {
            navigate('/login')
            return
        }

        clearSecureToken()

        clearUser()
        navigate('/')
    }

    return (
        <div className='flex w-full items-center bg-white/10 px-4 py-6 backdrop-blur-lg shadow-[0_8px_30px_rgba(0,0,0,0.18)] md:px-6'>
            <div className='ml-auto flex flex-wrap items-center justify-end gap-2'>
                {user && isAdmin ? (
                    <>
                        {adminActions.map((action) => (
                            <button
                                key={action.label}
                                type='button'
                                onClick={() => navigate(action.path)}
                                className={actionButtonClass}
                            >
                                {action.label}
                            </button>
                        ))}
                    </>
                ) : null}

                {user && !isAdmin && isUser ? (
                    <>
                        {userActions.map((action) => (
                            <button
                                key={action.label}
                                type='button'
                                onClick={() => navigate(action.path)}
                                className={actionButtonClass}
                            >
                                {action.label}
                            </button>
                        ))}
                    </>
                ) : null}

                <button
                    type='button'
                    onClick={handleAuthButtonClick}
                    className={actionButtonClass}
                >
                    {user ? 'Logout' : 'Login'}
                </button>
            </div>
        </div>
    )
}

export default Navbar
