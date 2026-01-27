'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import RecentActivityFeed from '@/components/RecentActivityFeed'
import { 
  PawPrint, 
  Search, 
  MessageCircle, 
  Heart, 
  MapPin, 
  Clock, 
  Users,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react'

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-500 p-2 rounded-lg">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Petly</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="btn-primary"
              >
                Comenzar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Reúne Mascotas Perdidas con sus Familias
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              La forma más rápida de reportar mascotas perdidas y ayudar a que las mascotas encontradas regresen a casa. 
              Únete a miles de amantes de las mascotas que hacen la diferencia en sus comunidades.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center"
              >
                Comenzar a Ayudar Mascotas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="btn-outline text-lg px-8 py-4"
              >
                Iniciar sesión
              </Link>
            </div>

            {/* Hero Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">1,000+</div>
                <div className="text-gray-600">Mascotas Reunidas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">5,000+</div>
                <div className="text-gray-600">Usuarios Activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">24/7</div>
                <div className="text-gray-600">Soporte Comunitario</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cómo Funciona Petly
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas simples, rápidas y efectivas para ayudar a las mascotas perdidas a encontrar el camino a casa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Reportar Mascotas Perdidas</h3>
              <p className="text-gray-600">
                Crea rápidamente reportes detallados con fotos, descripciones y últimas ubicaciones conocidas 
                para ayudar a tu comunidad a encontrar tu mascota perdida.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Reportar Mascotas Encontradas</h3>
              <p className="text-gray-600">
                ¿Encontraste una mascota? Crea un reporte para ayudar a los dueños a encontrar a sus queridos compañeros. 
                Cada reporte aumenta las posibilidades de una reunión feliz.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Conectar y Chatear</h3>
              <p className="text-gray-600">
                La mensajería directa entre dueños de mascotas y quienes las encuentran facilita la coordinación. 
                Organiza encuentros seguros y comparte actualizaciones en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué Elegir Petly?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Coincidencias Basadas en Ubicación</h3>
                    <p className="text-gray-600">
                      El seguimiento inteligente de ubicación ayuda a emparejar mascotas perdidas y encontradas en tu área, 
                      aumentando las posibilidades de reuniones exitosas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Actualizaciones en Tiempo Real</h3>
                    <p className="text-gray-600">
                      Recibe notificaciones instantáneas cuando alguien reporte una mascota que coincida con tu descripción. 
                      El tiempo es crítico en la recuperación de mascotas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Impulsado por la Comunidad</h3>
                    <p className="text-gray-600">
                      Únete a una comunidad solidaria de amantes de las mascotas que se ayudan activamente entre sí. 
                      Juntos, traemos mascotas a casa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-6">
                <div className="bg-primary-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PawPrint className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Historia de Éxito</h3>
              </div>
              
              <blockquote className="text-gray-600 italic mb-4">
                &ldquo;¡Petly me ayudó a encontrar a mi gata Luna en 6 horas! Alguien la había encontrado 
                y publicó inmediatamente. La función de chat hizo muy fácil coordinar la recogida. 
                ¡No puedo agradecer lo suficiente a esta comunidad!&rdquo;
              </blockquote>
              
              <div className="flex items-center justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-center text-gray-700 font-medium mt-2">- Sarah M.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecentActivityFeed />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para Ayudar a Reunir Mascotas?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a miles de amantes de las mascotas que hacen la diferencia. Crea tu cuenta gratuita hoy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium px-8 py-4 rounded-lg transition-colors text-lg flex items-center justify-center"
            >
              Crear Cuenta Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium px-8 py-4 rounded-lg transition-colors text-lg"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-primary-500 p-2 rounded-lg">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Petly</span>
            </div>
            <p className="text-gray-400 mb-6">
              Ayudando a las mascotas a encontrar el camino a casa, un reporte a la vez.
            </p>
            <p className="text-gray-500 text-sm">
              © 2026 Petly. Hecho con ❤️ para mascotas y sus familias.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}