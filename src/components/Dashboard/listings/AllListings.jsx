import DirectoryListingsDashboard from './DirectoryListingsDashboard';

const AllListings = ({ pageTitle, pageSubtitle }) => (
  <DirectoryListingsDashboard
    pageTitle={pageTitle}
    pageSubtitle={pageSubtitle}
    mode="all"
  />
);

export default AllListings;
