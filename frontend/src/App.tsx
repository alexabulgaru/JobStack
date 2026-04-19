import Navbar from './components/navbar'
import { Route, Routes } from 'react-router-dom'
import RegisterPage from './pages/register'
import LoginPage from './pages/login'
import UsersPage from './pages/users'
import RolesPage from './pages/roles'
import TagsPage from './pages/tags'
import StatusesPage from './pages/statuses'
import FeedbacksPage from './pages/feedbacks'
import FeedbackPage from './pages/feedback'
import JobsPage from './pages/jobs'
import JobsEditPage from './pages/jobs-edit'
import EvolutionPage from './pages/evolution'

function LandingPage() {
  return (
    <div className='min-h-screen bg-[#fd79a8]'>
      <Navbar />

      <div className='flex min-h-screen items-center justify-center px-4'>
        <h1 className='typewriter text-[clamp(4rem,14vw,12rem)] font-extrabold tracking-tight text-white'>
          JobStack
        </h1>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/users' element={<UsersPage />} />
      <Route path='/roles' element={<RolesPage />} />
      <Route path='/tags' element={<TagsPage />} />
      <Route path='/statuses' element={<StatusesPage />} />
      <Route path='/feedbacks' element={<FeedbacksPage />} />
      <Route path='/feedback' element={<FeedbackPage />} />
      <Route path='/jobs' element={<JobsPage />} />
      <Route path='/jobs/edit/:id' element={<JobsEditPage />} />
      <Route path='/evolution' element={<EvolutionPage />} />
    </Routes>
  )
}

export default App
