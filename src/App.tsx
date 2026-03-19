import { Component, type ReactNode, type ErrorInfo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "./lib/wallet/config";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TwinMatrixProvider } from "./contexts/TwinMatrixContext";
import HomePage from "./pages/HomePage";
import VerifyPage from "./pages/VerifyPage";
import MintPage from "./pages/MintPage";
import MatrixPage from "./pages/MatrixPage";
import AgentsOverviewPage from "./pages/agents/AgentsOverviewPage";
import AgentsConnectPage from "./pages/agents/AgentsConnectPage";
import AgentsSkillPage from "./pages/agents/AgentsSkillPage";
import AgentsApiPage from "./pages/agents/AgentsApiPage";
import AgentsExamplesPage from "./pages/agents/AgentsExamplesPage";
import AgentsConsolePage from "./pages/agents/AgentsConsolePage";
import SoulWizardPage from "./pages/SoulWizardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>⚠️ Twin Matrix — Configuration Error</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: "1.5rem", padding: "0.6rem 1.5rem", background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppErrorBoundary>
            <ThemeProvider>
              <TwinMatrixProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/verify" element={<VerifyPage />} />
                    <Route path="/mint" element={<MintPage />} />
                    <Route path="/matrix" element={<MatrixPage />} />
                    <Route path="/agents" element={<AgentsOverviewPage />} />
                    <Route path="/agents/connect" element={<AgentsConnectPage />} />
                    <Route path="/agents/skill" element={<AgentsSkillPage />} />
                    <Route path="/agents/api" element={<AgentsApiPage />} />
                    <Route path="/agents/examples" element={<AgentsExamplesPage />} />
                    <Route path="/agents/console" element={<AgentsConsolePage />} />
                    <Route path="/soul" element={<SoulWizardPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TwinMatrixProvider>
            </ThemeProvider>
          </AppErrorBoundary>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
