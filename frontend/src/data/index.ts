// Data barrel file - centralized mock data exports
// TODO: Replace individual modules with API service calls when backend is ready.

export { type Sermon, sermons, seriesList, speakerList } from './sermons';
export { type BlogPost, blogPosts, blogCategories } from './blog';
export { type ChurchEvent, eventsData, eventCategories } from './events';
export { type Album, type Photo, albums, photos } from './gallery';
export { type Resource, resources, resourceCategories, externalLinks } from './resources';
export {
  type Ministry,
  type MinistryDetail,
  ministries,
  ministriesData,
} from './ministries';
