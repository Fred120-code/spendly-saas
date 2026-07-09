import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Utilise toujours ces hooks dans tes composants, jamais useDispatch/useSelector
// directement depuis react-redux — ceux-ci sont typés avec ton store précis.
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
