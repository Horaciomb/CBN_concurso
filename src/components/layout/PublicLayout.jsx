import { Trophy } from 'lucide-react'

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-red-600" />
          <span className="text-base font-semibold text-gray-800">Concurso CBN — Inventario de Premios</span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
