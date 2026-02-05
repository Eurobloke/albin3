import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AppProvider, useApp } from "@/lib/app-context"
import { Login } from "@/components/login"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DashboardModule } from "@/components/modules/dashboard"
import { CalculadoraModule } from "@/components/modules/calculadora"
import { CotizacionesModule } from "@/components/modules/cotizaciones"
import { ClientesModule } from "@/components/modules/clientes"
import { PagosModule } from "@/components/modules/pagos"
import { CalendarioModule } from "@/components/modules/calendario"
import { GaleriaModule } from "@/components/modules/galeria"
import { Toaster } from "@/components/ui/sonner"

function MainApp() {
  const { currentModule } = useApp()

  const renderModule = () => {
    switch (currentModule) {
      case "dashboard":
        return <DashboardModule />
      case "calculadora":
        return <CalculadoraModule />
      case "cotizaciones":
        return <CotizacionesModule />
      case "clientes":
        return <ClientesModule />
      case "pagos":
        return <PagosModule />
      case "calendario":
        return <CalendarioModule />
      case "galeria":
        return <GaleriaModule />
      default:
        return <DashboardModule />
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar safe-bottom p-4 lg:p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}

export default App
