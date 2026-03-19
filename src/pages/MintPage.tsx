import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { useI18n } from '@/lib/i18n';
import { PageLayout } from '@/components/twin-matrix/PageLayout';

import { IdentityStep } from '@/components/twin-matrix/steps/IdentityStep';
import { CategoryStep } from '@/components/twin-matrix/steps/CategoryStep';
import { SportSetupStep } from '@/components/twin-matrix/steps/SportSetupStep';
import { SportTwinStep } from '@/components/twin-matrix/steps/SportTwinStep';
import { GamingSetupStep } from '@/components/twin-matrix/steps/GamingSetupStep';
import { FinanceSetupStep } from '@/components/twin-matrix/steps/FinanceSetupStep';
import { MusicSetupStep } from '@/components/twin-matrix/steps/MusicSetupStep';
import { FoodSetupStep } from '@/components/twin-matrix/steps/FoodSetupStep';
import { ArtSetupStep } from '@/components/twin-matrix/steps/ArtSetupStep';
import { ReadingSetupStep } from '@/components/twin-matrix/steps/ReadingSetupStep';
import { TravelSetupStep } from '@/components/twin-matrix/steps/TravelSetupStep';
import { LearningSetupStep } from '@/components/twin-matrix/steps/LearningSetupStep';
import { SoulStep } from '@/components/twin-matrix/steps/SoulStep';
import { GenerateStep } from '@/components/twin-matrix/steps/GenerateStep';
import { ReviewStep } from '@/components/twin-matrix/steps/ReviewStep';

const MintPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    isConnected,
    openConnectModal,
    hasMintedSbt,
    state,
    setState,
    next,
    handleGenerateComplete,
    txAction,
    handleMintSbt,
    handleUpdateMatrix,
    needsMatrixUpdate,
    isWrongNetwork,
    isSwitchingNetwork,
    switchToBscTestnet,
  } = useTwinMatrix();

  const showBack = state.step > 0 && state.step < 11;

  const handleBack = () => {
    setState((s) => {
      if (s.step >= 3 && s.step <= 8 && s.step !== 4) return { ...s, step: 2 };
      if (s.step >= 12 && s.step <= 15) return { ...s, step: 2 };
      if (s.step === 4) return { ...s, step: 3 }; // Sport twin -> Sport setup
      if (s.step === 9) return { ...s, step: 2 }; // Soul -> Category
      if (s.step === 11) return { ...s, step: 9 }; // Review -> Soul
      return { ...s, step: Math.max(0, s.step - 1) };
    });
  };

  const reviewActionLabel = useMemo(() => {
    if (!isConnected) return t('wallet.connect');
    if (needsMatrixUpdate || hasMintedSbt) return t('wizard.updateMatrix');
    return t('wizard.mintSbt');
  }, [isConnected, needsMatrixUpdate, hasMintedSbt, t]);

  // After successful mint/update, redirect to /matrix
  const handleMintAndRedirect = async () => {
    await handleMintSbt();
    navigate('/matrix');
  };

  const handleUpdateAndRedirect = async () => {
    await handleUpdateMatrix();
    navigate('/matrix');
  };

  return (
    <PageLayout activePage="identity">
      {showBack && (
        <button
          onClick={handleBack}
          className="absolute top-[5.5rem] left-4 md:left-6 z-20 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-lg leading-none">←</span>
          <span>{t('common.back')}</span>
        </button>
      )}

      {state.step <= 1 && (
        <IdentityStep data={state.profile} onUpdate={(p) => setState((s) => ({ ...s, profile: p }))} onNext={next} />
      )}
      {state.step === 2 && (
        <CategoryStep
          activeModules={state.activeModules}
          onUpdate={(m) => setState((s) => ({ ...s, activeModules: m }))}
          onNavigateToCategory={(id) => {
            const map: Record<string, number> = {
              sport: 3,
              gaming: 5,
              finance: 6,
              music: 7,
              food: 8,
              art: 12,
              reading: 13,
              travel: 14,
              learning: 15,
            };
            setState(s => ({ ...s, step: map[id] || 2 }));
          }}
          onProceedToSoul={() => setState(s => ({ ...s, step: 9 }))}
        />
      )}
      {state.step === 3 && (
        <SportSetupStep data={state.sportSetup} onUpdate={(d) => setState((s) => ({ ...s, sportSetup: d }))} onNext={() => setState(s => ({ ...s, step: 4 }))} />
      )}
      {state.step === 4 && (
        <SportTwinStep data={state.sportTwin} onUpdate={(d) => setState((s) => ({ ...s, sportTwin: d }))} onNext={() => setState(s => ({ ...s, step: 2 }))} />
      )}
      {state.step === 5 && (
        <GamingSetupStep data={state.gamingSetup} onUpdate={(d) => setState((s) => ({ ...s, gamingSetup: d }))} onNext={() => setState(s => ({ ...s, step: 2 }))} />
      )}
      {state.step === 6 && (
        <FinanceSetupStep data={state.financeSetup} onUpdate={(d) => setState((s) => ({ ...s, financeSetup: d }))} onNext={() => setState(s => ({ ...s, step: 2 }))} />
      )}
      {state.step === 7 && (
        <MusicSetupStep data={state.musicSetup} onUpdate={(d) => setState((s) => ({ ...s, musicSetup: d }))} onNext={() => setState(s => ({ ...s, step: 2 }))} />
      )}
      {state.step === 8 && (
        <FoodSetupStep data={state.foodSetup} onUpdate={(d) => setState((s) => ({ ...s, foodSetup: d }))} onNext={() => setState(s => ({ ...s, step: 2 }))} />
      )}
      {state.step === 12 && (
        <ArtSetupStep data={state.artSetup} onUpdate={(d) => setState((s) => ({ ...s, artSetup: d }))} onNext={() => setState(s => ({ ...s, step: 2 }))} />
      )}
      {state.step === 13 && (
        <ReadingSetupStep data={state.readingSetup} onUpdate={(d) => setState((s) => ({ ...s, readingSetup: d }))} onNext={() => setState(s => ({ ...s, step: 2 }))} />
      )}
      {state.step === 14 && (
        <TravelSetupStep data={state.travelSetup} onUpdate={(d) => setState((s) => ({ ...s, travelSetup: d }))} onNext={() => setState(s => ({ ...s, step: 2 }))} />
      )}
      {state.step === 15 && (
        <LearningSetupStep data={state.learningSetup} onUpdate={(d) => setState((s) => ({ ...s, learningSetup: d }))} onNext={() => setState(s => ({ ...s, step: 2 }))} />
      )}
      {state.step === 9 && (
        <SoulStep data={state.soul} onUpdate={(d) => setState((s) => ({ ...s, soul: d }))} onNext={next} />
      )}
      {state.step === 10 && <GenerateStep wizardState={state} onComplete={handleGenerateComplete} />}
      {state.step === 11 && (
        <ReviewStep
          signature={state.signature}
          tags={[]}
          activeModules={state.activeModules}
          onNext={next}
          onBack={() => setState((s) => ({ ...s, step: 9 }))}
          primaryActionLabel={reviewActionLabel}
          onPrimaryAction={!isConnected ? (openConnectModal ?? (() => { })) : (needsMatrixUpdate || hasMintedSbt ? handleUpdateAndRedirect : handleMintAndRedirect)}
          primaryActionLoading={txAction !== null}
          primaryActionDisabled={!isConnected ? false : (txAction !== null || isWrongNetwork || ((needsMatrixUpdate || hasMintedSbt) && state.signature.length !== 256))}
          networkMismatch={isWrongNetwork}
          expectedNetworkLabel="BSC Testnet (97)"
          onSwitchNetwork={switchToBscTestnet}
          switchingNetwork={isSwitchingNetwork}
        />
      )}
    </PageLayout>
  );
};

export default MintPage;
