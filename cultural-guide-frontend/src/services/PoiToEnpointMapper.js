import { fetchArtAndCulture } from './ArtAndCultureService';
import { fetchArticlesAndMagazines } from './ArticlesAndMagazinesService';
import { fetchEatAndDrinks } from './EatAndDrinksService';
import { fetchEvents } from './EventsService';
import { fetchNature } from './NatureService';
import { fetchOrganizations } from './OrganizationService';
import { fetchTypicalProducts } from './TypicalProductsService';
import { fetchShopping } from './ShoppingService';
import { fetchServices } from './ServicesService';
import { fetchEntertainmentLeisure } from './EntertainmentLeisureService';
import { fetchRoutes } from './RoutesService';
import { fetchSleep } from './SleepService';


const CATEGORY_ENDPOINT_MAP = {
    artculture: fetchArtAndCulture,
    articles: fetchArticlesAndMagazines,
    sleep: fetchSleep,
    events: fetchEvents,
    routes: fetchRoutes,
    eatanddrink: fetchEatAndDrinks,
    nature: fetchNature,
    organizations: fetchOrganizations,
    typicalproducts: fetchTypicalProducts,
    shopping: fetchShopping,
    services: fetchServices,
    entertainmentleisure: fetchEntertainmentLeisure,
};

export const mapCategoriesToEndpoints = (categories = []) => {
    if (!Array.isArray(categories)) return [];

    return categories
        .map(category => {
            // support both string and object input
            const key = typeof category === 'string'
                ? category
                : category?.category;

            return CATEGORY_ENDPOINT_MAP[key] || null;
        })
        .filter(Boolean); // remove nulls
};