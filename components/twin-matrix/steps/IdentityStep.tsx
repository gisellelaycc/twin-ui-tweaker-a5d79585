import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { UserProfile } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

const FIELDS: { key: keyof UserProfile; i18nKey: string; options: { value: string; key: string }[] }[] = [
  { key: 'ageBin', i18nKey: 'identity.age', options: [
    { value: '18–24', key: 'identity.opt.age.18_24' },
    { value: '25–34', key: 'identity.opt.age.25_34' },
    { value: '35–44', key: 'identity.opt.age.35_44' },
    { value: '45–54', key: 'identity.opt.age.45_54' },
    { value: '55–64', key: 'identity.opt.age.55_64' },
    { value: '65+', key: 'identity.opt.age.65_plus' },
  ] },
  { key: 'gender', i18nKey: 'identity.gender', options: [
    { value: 'Male', key: 'identity.opt.gender.male' },
    { value: 'Female', key: 'identity.opt.gender.female' },
    { value: 'Non-binary', key: 'identity.opt.gender.non_binary' },
    { value: 'Prefer not to say', key: 'identity.opt.common.prefer_not' },
  ] },
  { key: 'heightBin', i18nKey: 'identity.height', options: [
    { value: '< 160 cm', key: 'identity.opt.height.lt160' },
    { value: '160–170', key: 'identity.opt.height.160_170' },
    { value: '170–180', key: 'identity.opt.height.170_180' },
    { value: '> 180 cm', key: 'identity.opt.height.gt180' },
  ] },
  { key: 'weightBin', i18nKey: 'identity.weight', options: [
    { value: '< 50 kg', key: 'identity.opt.weight.lt50' },
    { value: '50–65', key: 'identity.opt.weight.50_65' },
    { value: '65–80', key: 'identity.opt.weight.65_80' },
    { value: '> 80 kg', key: 'identity.opt.weight.gt80' },
  ] },
  { key: 'education', i18nKey: 'identity.education', options: [
    { value: 'High School', key: 'identity.opt.education.high_school' },
    { value: "Bachelor's", key: 'identity.opt.education.bachelor' },
    { value: "Master's", key: 'identity.opt.education.master' },
    { value: 'Doctorate', key: 'identity.opt.education.doctorate' },
    { value: 'Other', key: 'identity.opt.common.other' },
    { value: 'Prefer not to say', key: 'identity.opt.common.prefer_not' },
  ] },
  { key: 'income', i18nKey: 'identity.income', options: [
    { value: '< $30k', key: 'identity.opt.income.lt30' },
    { value: '$30k–60k', key: 'identity.opt.income.30_60' },
    { value: '$60k–100k', key: 'identity.opt.income.60_100' },
    { value: '$100k+', key: 'identity.opt.income.gt100' },
    { value: 'Prefer not to say', key: 'identity.opt.common.prefer_not' },
  ] },
  { key: 'maritalStatus', i18nKey: 'identity.status', options: [
    { value: 'Single', key: 'identity.opt.marital.single' },
    { value: 'In a relationship', key: 'identity.opt.marital.relationship' },
    { value: 'Married', key: 'identity.opt.marital.married' },
    { value: 'N/A', key: 'identity.opt.marital.na' },
    { value: 'Prefer not to say', key: 'identity.opt.common.prefer_not' },
  ] },
  { key: 'occupation', i18nKey: 'identity.work', options: [
    { value: 'Student', key: 'identity.opt.occupation.student' },
    { value: 'Employee', key: 'identity.opt.occupation.employee' },
    { value: 'Self-employed', key: 'identity.opt.occupation.self_employed' },
    { value: 'Freelancer', key: 'identity.opt.occupation.freelancer' },
    { value: 'Other', key: 'identity.opt.common.other' },
  ] },
  { key: 'livingType', i18nKey: 'identity.living', options: [
    { value: 'Urban', key: 'identity.opt.living.urban' },
    { value: 'Suburban', key: 'identity.opt.living.suburban' },
    { value: 'Rural', key: 'identity.opt.living.rural' },
    { value: 'Prefer not to say', key: 'identity.opt.common.prefer_not' },
  ] },
];

interface Props {
  data: UserProfile;
  onUpdate: (d: UserProfile) => void;
  onNext: () => void;
}

export const IdentityStep = ({ data, onUpdate, onNext }: Props) => {
  const { t } = useI18n();
  const [profile, setProfile] = useState(data);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const update = (key: keyof UserProfile, val: string) => {
    const next = { ...profile, [key]: val === profile[key] ? '' : val };
    setProfile(next);
    onUpdate(next);
    if (val !== profile[key]) setOpenKey(null);
  };

  const toggle = (key: string) => setOpenKey(prev => (prev === key ? null : key));
  const answered = (key: keyof UserProfile) => !!profile[key];
  const getOptionLabel = (field: (typeof FIELDS)[number], value: string) => {
    const matched = field.options.find((option) => option.value === value);
    return matched ? t(matched.key) : value;
  };

  const rows: typeof FIELDS[] = [];
  for (let i = 0; i < FIELDS.length; i += 3) {
    rows.push(FIELDS.slice(i, i + 3));
  }

  return (
    <StepLayout>
      <StepContent>
        <div className="flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-2">
              {t('identity.title')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {t('identity.subtitle')}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 mb-12">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex flex-wrap justify-center gap-3">
                {row.map((f, i) => {
                  const globalIdx = rowIdx * 3 + i;
                  const isOpen = openKey === f.key;
                  const isAnswered = answered(f.key);
                  const driftDelay = `${(globalIdx * 0.6) % 3.5}s`;

                  return (
                    <div
                      key={f.key}
                      className={`relative flex flex-wrap items-center gap-2 transition-all duration-300 ${!isAnswered && !isOpen ? 'animate-chip-drift' : ''}`}
                      style={!isAnswered && !isOpen ? { animationDelay: driftDelay } : undefined}
                    >
                      <button
                        onClick={() => toggle(f.key)}
                        className={`inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-base transition-all duration-200 border whitespace-nowrap shrink-0 ${
                          isAnswered
                            ? 'border-foreground/15 text-foreground'
                            : 'border-foreground/10 text-foreground/60 hover:text-foreground/90 hover:border-foreground/15'
                        }`}
                        style={
                          isAnswered
                            ? { background: 'rgba(10, 255, 255, 0.08)', boxShadow: '0 0 10px rgba(10, 255, 255, 0.2), 0 0 20px rgba(10, 255, 255, 0.08)' }
                            : { background: 'var(--glass-bg)' }
                        }
                      >
                        <span className="font-medium">{t(f.i18nKey)}</span>
                        {isAnswered && <span className="text-sm text-foreground/60 ml-0.5">{getOptionLabel(f, profile[f.key])}</span>}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isAnswered ? 'text-foreground/40' : 'text-foreground/30'}`} />
                      </button>

                      {isOpen && (
                        <div className="animate-fade-in flex flex-wrap items-center gap-1.5">
                          {f.options.map(o => (
                            <button
                              key={o.value}
                              onClick={() => update(f.key, o.value)}
                              className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap ${
                                profile[f.key] === o.value
                                  ? 'border-foreground/20 text-foreground'
                                  : 'border-transparent text-foreground/40 hover:text-foreground/70'
                              }`}
                              style={
                                profile[f.key] === o.value
                                  ? { background: 'rgba(10, 255, 255, 0.12)', boxShadow: '0 0 8px rgba(10, 255, 255, 0.25)' }
                                  : { background: 'transparent' }
                              }
                            >
                              {t(o.key)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="w-full max-w-[520px]">
            <button onClick={onNext} className="btn-twin btn-twin-primary w-full py-2.5 text-sm btn-glow">
              {t('identity.cta')}
            </button>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
