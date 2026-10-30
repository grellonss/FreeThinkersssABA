// services/SleepService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchSleep = async (municipality, language = "it") => {
    return fetchCategoryCards("sleep", municipality, language, "Ospitalità e Chalet Alpini");
};