import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { Menu, LogOut, User, Shield, Stethoscope, ClipboardList, TestTube } from 'lucide-react'

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = React.useState(true)

  const getNavItems = () => {
    const baseItems = [
      { to: '/admin', label: 'Dashboard', icon: Shield, roles: ['ADMIN'] },
      { to: '/reception', label: 'Reception', icon: ClipboardList, roles: ['ADMIN', 'RECEPTIONIST'] },
      { to: '/doctor', label: 'Doctor', icon: Stethoscope, roles: ['ADMIN', 'DOCTOR'] },
      { to: '/lab', label: 'Lab', icon: TestTube, roles: ['ADMIN', 'LAB'] },
    ]
    
    return baseItems.filter(item => 
      item.roles.includes(user?.role)
    )
  }

  const nav = getNavItems()

  return (
    <div className="min-h-screen grid transition-all duration-300" style={{ gridTemplateColumns: open ? '16rem 1fr' : '4rem 1fr' }}>
      <aside className="border-r bg-gradient-to-b from-blue-50 to-indigo-50 shadow-lg">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-blue-100">
          <button 
            className="p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200" 
            onClick={()=>setOpen(v=>!v)}
          >
            <Menu size={18} className="text-blue-600" />
          </button>
          {open && (
            <Link to="/" className="font-bold text-xl text-blue-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              Hospital
            </Link>
          )}
        </div>
        <nav className="p-3 space-y-2">
          {nav.map(item => {
            const Icon = item.icon
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({isActive})=>`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'hover:bg-blue-100 text-blue-700 hover:shadow-md'
                  }
                `}
              >
                <Icon size={20} className={open ? '' : 'mx-auto'} />
                {open && <span className="font-medium">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>
      </aside>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center px-6 gap-2 shadow-sm">
          <div className="ml-auto flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full border-2 border-blue-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                )}
                <div className="text-sm">
                  <div className="font-medium text-gray-800">{user.fullName}</div>
                  <div className="text-gray-500 capitalize">{user.role.toLowerCase()}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              onClick={logout}
            >
              <LogOut size={16}/>
              <span className="text-sm font-medium">Logout</span>
            </button>
            </div>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}


