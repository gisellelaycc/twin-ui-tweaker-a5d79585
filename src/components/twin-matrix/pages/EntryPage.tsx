interface Props {
  onHumanEntry: () => void;
  onAgentEntry: () => void;
}

export const EntryPage = ({ onHumanEntry, onAgentEntry }: Props) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
    <h1 className="font-heading text-4xl font-bold text-foreground">Welcome to Twin3</h1>
    <p className="max-w-md text-muted-foreground">Your decentralized digital identity starts here.</p>
    <div className="flex gap-4">
      <button onClick={onHumanEntry} className="btn-twin btn-twin-primary px-8 py-3 text-base btn-glow">I am Human</button>
      <button onClick={onAgentEntry} className="btn-twin px-8 py-3 text-base border border-foreground/15 text-foreground/70 hover:text-foreground">I am an Agent</button>
    </div>
  </div>
);
export default EntryPage;
