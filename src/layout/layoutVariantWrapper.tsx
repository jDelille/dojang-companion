import { useEffect } from "react";
import { useAppDispatch } from "../redux/hooks";
import { setVariant, type LayoutVariant } from "../redux/slices/layoutSlice";

export type { LayoutVariant };

/*
   Only sets the active layout variant in Redux — the sidebar/header shell
   itself already comes from PublicLayout (every route in publicRoutes is
   wrapped in one AppShell there). Wrapping in a second AppShell here used to
   render the sidebar and header twice on every layout-demo page.
*/
const LayoutVariantWrapper = ({
  variant,
  children,
}: {
  variant: LayoutVariant;
  children: React.ReactNode;
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setVariant(variant));
    return () => {
      dispatch(setVariant("default"));
    };
  }, [dispatch, variant]);

  return <>{children}</>;
};

export default LayoutVariantWrapper;
