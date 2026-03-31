import Navigation from '@/components/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:pl-56">
      <Navigation role="employee" />
      {children}
    </div>
  )
}