import { useState, FormEvent } from 'react';
import { samplePlans } from '../data';
import { Check, ShieldAlert, Award, Star } from 'lucide-react';

interface BusinessOnboardingProps {
  onOnboardingComplete: (businessName: string, planId: string) => void;
}

export default function BusinessOnboarding({ onOnboardingComplete }: BusinessOnboardingProps) {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('profesional');
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!businessName || !email || !password || !confirmPassword) {
      setErrorText('Por favor complete todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorText('Las contraseñas no coinciden.');
      return;
    }

    setErrorText(null);
    setSuccess(true);
  };

  const handleGoToApp = () => {
    onOnboardingComplete(businessName || 'Barbería Registrada', selectedPlanId);
  };

  if (success) {
    const plan = samplePlans.find((p) => p.id === selectedPlanId);
    return (
      <div className="w-full max-w-xl mx-auto bg-white border border-[#D1D1D6] rounded-xl p-8 text-center space-y-6">
        <div className="w-14 h-14 bg-[#34C759] text-white rounded-full flex items-center justify-center mx-auto">
          <Check className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-medium text-[#1D1D1F] tracking-tight">
            ¡Registro Exitoso!
          </h2>
          <p className="text-sm text-[#6E6E73]">
            La cuenta de <span className="text-[#1D1D1F] font-semibold">{businessName}</span> ha sido configurada.
          </p>
        </div>

        <div className="bg-[#F5F5F7] rounded-lg p-5 border border-[#E5E5EA] text-left space-y-2 text-xs">
          <p className="text-[#6E6E73]">Resumen de Onboarding:</p>
          <p className="text-[#1D1D1F]">
            <span className="font-semibold">Plan Seleccionado:</span> {plan?.name} — {plan?.price}
          </p>
          <p className="text-[#1D1D1F]">
            <span className="font-semibold">Restricciones:</span> {plan?.limits}
          </p>
          <p className="text-[#1D1D1F]">
            <span className="font-semibold">Correo de Acceso:</span> {email}
          </p>
        </div>

        <button
          onClick={handleGoToApp}
          className="w-full py-2.5 bg-[#0071E3] text-white hover:bg-[#005ebd] text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          Acceder al Panel de Control
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pt-2">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-[#0071E3]">
          ONBOARDING DE NUEVA BARBERÍA
        </p>
        <h1 className="text-2xl font-medium text-[#1D1D1F] tracking-tight">
          Crea la cuenta de tu negocio
        </h1>
        <p className="text-sm text-[#6E6E73]">
          AgendaBarber te permite automatizar completamente las citas de tus clientes por WhatsApp y Web.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#D1D1D6] rounded-xl p-6 md:p-8 space-y-6">
        {errorText && (
          <div className="bg-[#FF3B30]/5 text-[#FF3B30] border border-[#FF3B30]/15 p-4 rounded-lg text-xs flex items-start gap-2.5 animate-fade-in mb-2">
            <ShieldAlert className="w-4 h-4 text-[#FF3B30] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold">Ha ocurrido un problema:</span>
              <p className="text-[#6E6E73]">{errorText}</p>
            </div>
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1">
              Nombre de la barbería *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ej. Barbería El Navajero"
              className="w-full px-3 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1">
              Correo electrónico del administrador *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@barberia.com"
              className="w-full px-3 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1">
              Confirmar contraseña *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="w-full px-3 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
            />
          </div>
        </div>

        {/* Plan Selector */}
        <div className="space-y-4 pt-4 border-t border-[#E5E5EA]">
          <div>
            <h3 className="text-sm font-medium text-[#1D1D1F]">
              Selecciona tu Plan Mensual
            </h3>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Todos los planes incluyen el chatbot de auto-agendado de WhatsApp de cortesía.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {samplePlans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`border rounded-lg p-5 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0071E3] bg-[#0071E3]/5'
                      : 'border-[#D1D1D6] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-[#1D1D1F]">
                        Plan {plan.name}
                      </span>
                      {plan.id === 'profesional' && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#0071E3] text-white font-medium">
                          RECOMENDADO
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-[#1D1D1F] tracking-tight">
                        {plan.price}
                      </h4>
                      <p className="text-[10px] text-[#6E6E73] mt-0.5">
                        {plan.limits}
                      </p>
                    </div>

                    <ul className="space-y-1.5 text-xs text-[#6E6E73] pt-3 border-t border-[#E5E5EA]">
                      {plan.details.map((detail, index) => (
                        <li key={index} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 mt-auto">
                    <button
                      type="button"
                      className={`w-full py-1.5 rounded-md text-xs font-medium cursor-pointer ${
                        isSelected
                          ? 'bg-[#0071E3] text-white'
                          : 'bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA]'
                      }`}
                    >
                      {isSelected ? 'Seleccionado' : 'Elegir'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E5EA] flex justify-end">
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-2.5 bg-[#0071E3] text-white hover:bg-[#005ebd] text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  );
}
