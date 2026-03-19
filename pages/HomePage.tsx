import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { PageLayout } from '@/components/twin-matrix/PageLayout';
import { EntryPage } from '@/components/twin-matrix/pages/EntryPage';

const HomePage = () => {
  const navigate = useNavigate();
  const { isConnected, openConnectModal } = useTwinMatrix();

  return (
    <PageLayout activePage={null}>
      <EntryPage
        onHumanEntry={() => navigate('/verify')}
        onAgentEntry={() => navigate('/agents')}
      />
    </PageLayout>
  );
};

export default HomePage;
