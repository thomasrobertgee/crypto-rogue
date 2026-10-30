import { ShieldCheck, User } from 'lucide-react'
import type { AuthAccountType } from '../state/useMetaStore'

export interface LoginModalProps {
  onLogin: (type: Exclude<AuthAccountType, null>) => void
  className?: string
}

export function LoginModal({ onLogin, className = '' }: LoginModalProps) {
  return (
    <div
      className={`w-full max-w-[340px] rounded-3xl border-3 border-[#3E2723] bg-[#FFFDF9] p-5 shadow-[0_12px_32px_rgba(44,24,16,0.35),inset_0_2px_0_#ffffff] select-none ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-2 flex h-13 w-13 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-amber-300 to-amber-500 shadow-inner">
          <ShieldCheck className="h-7 w-7 text-[#2C1810]" />
        </div>
        <h2 className="font-display font-black text-lg text-[#2C1810] tracking-wide uppercase">
          SIGN IN TO TRADE
        </h2>
        <p className="mt-1 font-sans text-xs font-semibold text-[#6E5A4F]">
          Link your account to protect your crypto tokens and cross-device portfolio.
        </p>
      </div>

      {/* Social Buttons */}
      <div className="mt-4 space-y-2.5">
        {/* Google */}
        <button
          type="button"
          onClick={() => onLogin('google')}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#3E2723] bg-white px-4 py-2.5 shadow-[0_3px_0_#3E2723] transition active:translate-y-0.5 active:shadow-none hover:bg-slate-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="font-display font-extrabold text-xs text-[#2C1810]">
            Continue with Google
          </span>
        </button>

        {/* X (Twitter) */}
        <button
          type="button"
          onClick={() => onLogin('x')}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#3E2723] bg-black px-4 py-2.5 text-white shadow-[0_3px_0_#3E2723] transition active:translate-y-0.5 active:shadow-none hover:bg-neutral-900"
        >
          <span className="font-sans font-black text-sm">𝕏</span>
          <span className="font-display font-extrabold text-xs">
            Continue with X
          </span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={() => onLogin('facebook')}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#3E2723] bg-[#1877F2] px-4 py-2.5 text-white shadow-[0_3px_0_#0f4c97] transition active:translate-y-0.5 active:shadow-none hover:bg-[#166fe5]"
        >
          <span className="font-sans font-black text-sm">f</span>
          <span className="font-display font-extrabold text-xs">
            Continue with Facebook
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-3.5 flex items-center justify-center">
        <div className="w-full border-t border-[#E2D5C1]" />
        <span className="absolute bg-[#FFFDF9] px-2 font-display text-[10px] font-black uppercase text-[#8C7A6B]">
          OR FAST PLAY
        </span>
      </div>

      {/* Prominent Play as Guest Button (Upgraded Ergonomic Touch Target h-[52px]) */}
      <button
        type="button"
        onClick={() => onLogin('guest')}
        className="btn-3d-gold flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl px-5 text-sm font-black uppercase tracking-wide text-white shadow-lg active:scale-95 transition-transform"
      >
        <User className="h-5 w-5 text-white stroke-[2.5]" />
        <span>Play as Guest (Fast Play)</span>
      </button>
    </div>
  )
}

export default LoginModal
