import { Hono } from 'hono';
import type { Env } from '../types';
import { searchLocations } from '../services/locations';

const locations = new Hono<{ Bindings: Env }>();

locations.get('/search', (c) => {
  const q = c.req.query('q') || '';
  const data = searchLocations(q);
  return c.json({ data });
});

export default locations;
