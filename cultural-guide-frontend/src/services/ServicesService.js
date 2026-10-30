// services/ServicesService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchServices = async (municipality, language = "it") => {
    return fetchCategoryCards("services", municipality, language, "Servizi Turistici Svizzeri");
};