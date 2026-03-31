import Navigation from '@/components/navigation'

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:pl-56">
      <Navigation role="employee" />
      {children}
    </div>
  )
}