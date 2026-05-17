import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useSearchParams } from 'react-router-dom'

import { setExternalUserId } from '@/lib/session'
import { ComprehensiveOffersPage } from '@/pages/ComprehensiveOffersPage'
import { HomePage } from '@/pages/HomePage'
import { OtpPage } from '@/pages/OtpPage'
import { PayPage } from '@/pages/PayPage'
import { ThirdPartyOffersPage } from '@/pages/ThirdPartyOffersPage'
import { VehicleDetailsPage } from '@/pages/VehicleDetailsPage'

function UserIdFromQuerySync() {
  const [params] = useSearchParams()

  useEffect(() => {
    const id = params.get('user_id')
    if (id) setExternalUserId(id.trim())
  }, [params])

  return null
}

function AppRoutes() {
  return (
    <>
      <UserIdFromQuerySync />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vehicle-details" element={<VehicleDetailsPage />} />
        <Route path="/offers/third-party" element={<ThirdPartyOffersPage />} />
        <Route path="/offers/comprehensive" element={<ComprehensiveOffersPage />} />
        <Route path="/pay" element={<PayPage />} />
        <Route path="/otp" element={<OtpPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
