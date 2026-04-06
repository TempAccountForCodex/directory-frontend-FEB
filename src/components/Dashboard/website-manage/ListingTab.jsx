import { memo } from 'react';
import { LayoutGrid } from 'lucide-react';
import { EmptyState } from '../shared';
import DashboardActionButton from '../shared/DashboardActionButton';
import { useNavigate } from 'react-router-dom';

const ListingTab = memo(({ website, websiteId }) => {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={<LayoutGrid size={48} />}
      title="Directory Listing Coming Soon"
      subtitle="Update your business details, categories, and appear in the Techietribe directory search to reach more customers."
      action={
        <DashboardActionButton
          variant="outlined"
          onClick={() => navigate('/dashboard/listings')}
          aria-label="Go to business directory"
        >
          Go to Directory
        </DashboardActionButton>
      }
    />
  );
});

ListingTab.displayName = 'ListingTab';

export default ListingTab;
