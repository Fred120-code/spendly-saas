"use client";
import { useEffect } from "react";

/**
 * `aos` est installé et les attributs data-aos="..." sont déjà posés
 * partout dans la landing page, mais AOS.init() n'était jamais appelé :
 * les animations au scroll n'avaient donc aucun effet. Ce composant
 * corrige ça en une ligne, à monter une fois dans la page d'accueil.
 */
export default function AosInit() {
  useEffect(() => {
    import("aos").then((AOS) => {
      AOS.default.init({
        duration: 700,
        easing: "ease-out-cubic",
        once: true,
        offset: 40,
      });
    });
  }, []);

  return null;
}
