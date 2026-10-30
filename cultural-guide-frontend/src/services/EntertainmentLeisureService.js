// services/EntertainmentLeisureService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchEntertainmentLeisure = async (municipality, language = "it") => {
    return fetchCategoryCards("entertainment-leisure", municipality, language, "Svago e Benessere");
};
