import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import HomePage from '@/pages/HomePage'
import InsurancePlansPage from '@/pages/InsurancePlansPage'
import OtpPage from '@/pages/OtpPage'
import PaymentPage from '@/pages/PaymentPage'
import ThanksPage from '@/pages/ThanksPage'
import VehicleDetailsPage from '@/pages/VehicleDetailsPage'
import WaitPage from '@/pages/WaitPage'

export default function App() {
  return (
    <div dir="rtl">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vehicle" element={<VehicleDetailsPage />} />
          <Route path="/plans/:variant" element={<InsurancePlansPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/wait" element={<WaitPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/thanks" element={<ThanksPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
