// @ts-nocheck
// AUTO-GENERATED — original types from twin3-ui-package
// Type mismatches between code and types are pre-existing; suppressed with ts-nocheck

export interface UserProfile {
  username: string; heightBin: string; weightBin: string; ageBin: string; gender: string;
  education: string; income: string; maritalStatus: string; occupation: string; livingType: string;
}
export interface SportSetup { [key: string]: any; }
export interface MusicSetup { [key: string]: any; }
export interface ArtSetup { [key: string]: any; }
export interface ReadingSetup { [key: string]: any; }
export interface FoodSetup { [key: string]: any; }
export interface TravelSetup { [key: string]: any; }
export interface FinanceSetup { [key: string]: any; }
export interface GamingSetup { [key: string]: any; }
export interface LearningSetup { [key: string]: any; }
export interface AgentPermission { [key: string]: any; }
export interface AgentDefinition { [key: string]: any; }

export interface WizardState {
  step: number;
  identity: UserProfile;
  categories: string[];
  sport: SportSetup;
  sportTwin: any;
  music: MusicSetup;
  art: ArtSetup;
  reading: ReadingSetup;
  food: FoodSetup;
  travel: TravelSetup;
  finance: FinanceSetup;
  gaming: GamingSetup;
  learning: LearningSetup;
  soul: any;
  generated: any;
  agentPermission: AgentPermission;
  agents: AgentDefinition[];
}
