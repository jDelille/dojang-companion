import LayoutVariantWrapper from "../../../layout/layoutVariantWrapper";
import Dashboard from "../dashboard/dashboard";

const LayoutHidden = () => (
  <LayoutVariantWrapper variant="hidden">
   <Dashboard/>
  </LayoutVariantWrapper>
);

export default LayoutHidden;
