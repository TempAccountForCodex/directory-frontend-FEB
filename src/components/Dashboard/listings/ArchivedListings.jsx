import DirectoryListingsDashboard from './DirectoryListingsDashboard';

const ArchivedListings = ({ pageTitle, pageSubtitle }) => (
  <DirectoryListingsDashboard
    pageTitle={pageTitle}
    pageSubtitle={pageSubtitle}
    mode="archived"
  />
);

export default ArchivedListings;
