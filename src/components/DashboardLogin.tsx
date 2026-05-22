import { useState, FormEvent } from 'react';
import { Eye, EyeOff, Lock, Mail, Scissors } from 'lucide-react';

interface DashboardLoginProps {
  onLoginSuccess: (email: string, password: string) => Promise<void>;
}

export default function DashboardLogin({ onLoginSuccess }: DashboardLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsSubmitting(true);
      setErrorText(null);
      try {
        await onLoginSuccess(email, password);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-[#D1D1D6] rounded-xl p-6 md:p-8 space-y-8">
      {/* Centered Logo/Branding */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-[#0071E3] text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
          <Scissors className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-medium text-[#1D1D1F] tracking-tight">
            AgendaBarber
          </h1>
          <p className="text-xs text-[#6E6E73] mt-1">
            Plataforma SaaS de Citas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#6E6E73] mb-1">
            Correo electrónico
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E6E73]">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6E6E73] mb-1">
            Contraseña
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E6E73]">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full pl-9 pr-9 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-[#0071E3] text-white hover:bg-[#005ebd] text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          {isSubmitting ? 'Validando...' : 'Iniciar sesión'}
        </button>
        {errorText && (
          <p className="text-xs text-[#FF3B30] text-center">{errorText}</p>
        )}
      </form>
    </div>
  );
}
