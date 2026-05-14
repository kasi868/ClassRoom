import IMAGES from './images';

/**
 * Centralized list of schools available in the application.
 * This data is shared across multiple screens (e.g., WelcomeSplashScreen, LoginScreen).
 *
 * @type {Array<Object>}
 */
export const SCHOOLS = [
  {
    id: 'aachi',
    name: 'Aachi Global school Ayanambakam',
    shortName: '( AACHI )',
    logo: IMAGES.AACHI_GLOBAL_SCHOOL_LOGO,
  },

  {
    id: '7i',
    name: '7i World School',
    shortName: 'HSP (7i World School)',
    logo: IMAGES.i7_WORLD_SCHOOL_LOGO,
  },

  {
    id: 'ak-children',
    name: 'A.K Children Acadamy',
    shortName: '( A.K Children Acadamy )',
    logo: IMAGES.AK_CHILDREN_SCHOOL_LOGO,
  },

  {
    id: 'ajivasan',
    name: '2022 Ajivasan Online Branch',
    shortName: '( Music Acadamy )',
    logo: IMAGES.AJIVASAN_SCHOOL_LOGO,
  },

  {
    id: 'aditya',
    name: 'Aditya Public School',
    shortName: '( APS )',
    logo: IMAGES.ADITYA_SCHOOL_LOGO,
  },
];