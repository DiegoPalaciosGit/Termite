import { login } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 w-full max-w-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Termite</h1>
          <p className="text-sm text-gray-500 mt-1">Control de producción · Escobar</p>
        </div>

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="carlos@escobar.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
          >
            Entrar
          </button>
        </form>

        {/* Error shown after redirect */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (new URLSearchParams(window.location.search).get('error')) {
                document.querySelector('form').insertAdjacentHTML('afterend',
                  '<p class="mt-3 text-sm text-red-600 text-center">Correo o contraseña incorrectos</p>')
              }
            `,
          }}
        />
      </div>
    </div>
  )
}
