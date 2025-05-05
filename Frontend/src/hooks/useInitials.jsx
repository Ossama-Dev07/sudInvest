import { useEffect, useState } from "react";

function useInitials(nom, prenom) {
  const [initials, setInitials] = useState("");

  // Create initials in "PN" format
  const generateInitials = () => {
    const firstInitial = prenom.charAt(0).toUpperCase();
    const lastInitial = nom.charAt(0).toUpperCase();
    setInitials(`${firstInitial}${lastInitial}`);
  };


 useEffect(() => {
    generateInitials();
  }, [nom, prenom]);

  return initials;
}

export default useInitials;
