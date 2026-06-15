import DirectoryListingsDashboard from './DirectoryListingsDashboard';

const ModifyListing = ({ pageTitle, pageSubtitle }) => (
  <DirectoryListingsDashboard
    pageTitle={pageTitle}
    pageSubtitle={pageSubtitle}
    mode="modify"
  />
);

export default ModifyListing;
