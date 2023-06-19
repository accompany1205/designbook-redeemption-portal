import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

export default function Header() {
  let [searchParams, setSearchParams] = useSearchParams();

  const claimUrl = searchParams.get("claim");

  const urlState = useLocation().state;

  const { width } = useWindowDimensions();
  return width < 768 ? (
    <MobileHeader urlState={claimUrl ? { claim: claimUrl } : urlState} />
  ) : (
    <DesktopHeader urlState={claimUrl ? { claim: claimUrl } : urlState} />
  );
}
