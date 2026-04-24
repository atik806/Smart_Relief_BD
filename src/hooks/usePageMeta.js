import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'Smart Relief BD';

const ROUTES = {
  '/': {
    title: `Dashboard | ${SITE}`,
    description:
      'Bangladesh emergency operations dashboard: air quality, flood tools, health triage, and citizen reporting.',
  },
  '/flood-map': {
    title: `Flood Map | ${SITE}`,
    description:
      'Interactive flood map for Bangladesh: zones, hospitals, citizen reports, and navigation.',
  },
  '/health': {
    title: `Health Assistant | ${SITE}`,
    description:
      'Flood-context health triage and first-aid guidance for Bangladesh disaster response.',
  },
  '/report': {
    title: `Report an Issue | ${SITE}`,
    description:
      'Submit smart city and flood-related issues to Smart Relief BD for triage and response.',
  },
};

const NOT_FOUND_META = {
  title: `Page not found | ${SITE}`,
  description:
    'This page does not exist. Use the navigation menu to return to the Smart Relief BD dashboard.',
};

function setMetaDescription(content) {
  let el = document.querySelector('meta[name="description"]');
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', 'description');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Updates document title and meta description from the current route.
 */
export function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = ROUTES[pathname] ?? NOT_FOUND_META;
    document.title = meta.title;
    setMetaDescription(meta.description);
  }, [pathname]);
}
