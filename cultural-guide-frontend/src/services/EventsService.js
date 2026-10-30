// services/EventsService.js
import { fetchCategoryCards } from "./apiUtils";

export const fetchEvents = async (municipality, language = "it") => {
    return fetchCategoryCards("events", municipality, language, "Eventi e Festival Svizzeri");
};