import { login } from './actions'

function TermiteLogo() {
  return (
    <svg
      width="48"
      height="58"
      viewBox="0 0 44 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon points="10,3 19,20 12,20 3,3" stroke="#3B2A1A" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="34,3 25,20 32,20 41,3" stroke="#3B2A1A" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="22" cy="27" r="6.5" stroke="#3B2A1A" strokeWidth="2.5"/>
      <circle cx="22" cy="43" r="11" stroke="#3B2A1A" strokeWidth="2.5"/>
    </svg>
  )
}

const inputCls = 'w-full px-0 py-2.5 border-0 border-b border-warm bg-transparent text-bark text-sm focus:outline-none focus:border-bark transition-colors placeholder:text-dust'

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-linen flex items-center justify-center p-6">
      <div className="w-full max-w-xs">
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <TermiteLogo />
          </div>
          <h1 className="text-lg font-semibold text-bark tracking-tight">termite</h1>
          <p className="text-sm text-dust mt-1">Carpintería Escobar</p>
        </div>

        <form action={login} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue="carlos@escobar.com"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors mt-2"
          >
            Entrar
          </button>
        </form>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (new URLSearchParams(window.location.search).get('error')) {
                document.querySelector('form').insertAdjacentHTML('afterend',
                  '<p class="mt-4 text-xs text-rust text-center">Correo o contraseña incorrectos.</p>')
              }
            `,
          }}
        />
      </div>
    </div>
  )
}
