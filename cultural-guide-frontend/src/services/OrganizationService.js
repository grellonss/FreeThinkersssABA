// services/OrganizationService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchOrganizations = async (municipality, language = "it") => {
    return fetchCategoryCards("organizations", municipality, language, "Organizzazioni e Turismo Svizzero");
};
