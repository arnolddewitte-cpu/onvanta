import Navigation from '@/components/navigation'

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:pl-56">
      <Navigation role="manager" />
      {children}
    </div>
  )
}