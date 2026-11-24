/**
 * Dev-only UI fixtures: a fake signed-in owner and an in-memory `/api/*`, so
 * the management UI can be developed, screenshotted, and reviewed without
 * Google OAuth, Neon, or Netlify functions.
 *
 *   HOMESLATE_UI_FIXTURES=1 npm run dev
 *
 * Visit `/?as=guest` to browse signed out, `/?as=owner` to sign back in.
 * Never enabled in `vite build`.
 */
import type { Connect, Plugin } from 'vite';
import { randomUUID } from 'node:crypto';

type Json = Record<string, unknown>;

interface FixtureDisplay {
  id: string;
  display_id: string;
  name: string;
  passcode_enabled: boolean;
  is_owner: boolean;
  owner_plan: string;
  config: Json | null;
}

const USER = {
  id: 'fixture-user',
  email: 'sam@homeslate.dev',
  name: 'Sam Rivera',
  picture: '',
  plan: 'free',
  subscriptionStatus: null,
  canManageSubscription: false,
};

function widget(type: string, title: string, x: number, y: number, w: number, h: number, config: Json) {
  return { id: randomUUID(), type, title, config, layout: { x, y, w, h, minW: 2, minH: 2 } };
}

const clock = (x: number, y: number, w = 3, h = 2) =>
  widget('clock', 'Clock', x, y, w, h, {
    showSeconds: false,
    showDate: true,
    use24Hour: false,
    timezone: 'local',
    transparentBackground: false,
    textAlign: 'center',
  });
const weather = (x: number, y: number, w = 3, h = 3) =>
  widget('weather', 'Weather', x, y, w, h, {
    location: 'Portland, OR',
    latitude: 45.5152,
    longitude: -122.6784,
    units: 'imperial',
    showForecast: true,
    forecastDays: 5,
    transparentBackground: false,
    showAirQuality: false,
    textAlign: 'left',
  });
const todo = (x: number, y: number, items: string[], w = 3, h = 4) =>
  widget('todo', 'To-Do List', x, y, w, h, {
    items: items.map((text, i) => ({ id: `todo-${i}-${text}`, text, completed: i === 1 })),
    hideCompleted: false,
    transparentBackground: false,
  });
const news = (x: number, y: number, w = 6, h = 4) =>
  widget('news', 'News', x, y, w, h, {
    feedUrls: [],
    maxItems: 10,
    showSource: true,
    showDescription: false,
    transparentBackground: false,
  });

function layout(name: string, icon: string, widgets: unknown[], hidden = false) {
  return { id: randomUUID(), name, icon, widgets, columns: 12, rowHeight: 80, hidden };
}

function makeDisplays(): FixtureDisplay[] {
  const kitchen = [
    layout('Morning', 'IconSun', [
      clock(0, 0),
      weather(3, 0),
      todo(6, 0, ['Pack lunches', 'Feed the cat', 'Water plants']),
      news(0, 3),
    ]),
    layout('Evening', 'IconMoon', [clock(0, 0), todo(3, 0, ['Dishes', 'Homework check', 'Trash night'])]),
    layout('Weekend', 'IconCalendarWeek', [clock(0, 0), weather(3, 0)], true),
  ];
  const hallway = [layout('Family board', 'IconHome', [clock(0, 0, 4, 2), weather(4, 0, 4, 3)])];
  const grandma = [layout('Photos', 'IconPhoto', [clock(0, 0)])];

  const config = (layouts: ReturnType<typeof layout>[], extra: Json = {}) => ({
    layouts,
    activeLayoutId: layouts[0]?.id ?? null,
    rotationEnabled: layouts.length > 1,
    rotationIntervalMs: 60000,
    themes: [],
    activeThemeId: null,
    colorMode: 'dark',
    stickyNotesEnabled: false,
    voiceEnabled: false,
    holidayEffectsEnabled: true,
    alarms: [],
    ...extra,
  });

  return [
    {
      id: 'kitchen',
      display_id: '6f1c2a40-0000-4000-8000-00000000c0de',
      name: 'Kitchen',
      passcode_enabled: true,
      is_owner: true,
      owner_plan: 'free',
      config: config(kitchen),
    },
    {
      id: 'hallway',
      display_id: '6f1c2a40-0000-4000-8000-0000000000a1',
      name: 'Hallway',
      passcode_enabled: false,
      is_owner: false,
      owner_plan: 'pro',
      config: config(hallway, { colorMode: 'light' }),
    },
    {
      id: 'grandma',
      display_id: '6f1c2a40-0000-4000-8000-0000000000b2',
      name: "Grandma's living room",
      passcode_enabled: false,
      is_owner: false,
      owner_plan: 'pro',
      config: config(grandma),
    },
  ];
}

/** Runs before React: seed (or clear) the fake session in localStorage. */
const SESSION_SCRIPT = `
(() => {
  const as = new URLSearchParams(location.search).get('as');
  if (as === 'guest') sessionStorage.setItem('hs-fixture-guest', '1');
  if (as === 'owner') sessionStorage.removeItem('hs-fixture-guest');
  const keys = ['gcal_access_token', 'gcal_token_expiry', 'auth_user', 'gcal_refresh_token'];
  if (sessionStorage.getItem('hs-fixture-guest')) {
    keys.forEach((k) => localStorage.removeItem(k));
    return;
  }
  localStorage.setItem('gcal_access_token', 'fixture-token');
  localStorage.setItem('gcal_token_expiry', String(Date.now() + 864e5));
  localStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(USER))});
})();
`;

export function uiFixtures(): Plugin {
  let displays = makeDisplays();
  const invites: Json[] = [];
  const collaborators: Json[] = [
    {
      id: 'collab-1',
      email: 'alex@example.com',
      name: 'Alex Rivera',
      picture: '',
      created_at: '2026-10-02T12:00:00Z',
    },
  ];

  const send = (res: Parameters<Connect.NextHandleFunction>[1], status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  };

  const readBody = (req: Connect.IncomingMessage) =>
    new Promise<Json>((resolve) => {
      let raw = '';
      req.on('data', (chunk) => (raw += chunk));
      req.on('end', () => {
        try {
          resolve(raw ? (JSON.parse(raw) as Json) : {});
        } catch {
          resolve({});
        }
      });
    });

  return {
    name: 'homeslate-ui-fixtures',
    apply: 'serve',
    transformIndexHtml: () => [{ tag: 'script', children: SESSION_SCRIPT, injectTo: 'head-prepend' }],
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        const url = new URL(req.url, 'http://fixtures.local');
        const route = url.pathname.replace(/^\/api\//, '');
        const method = req.method ?? 'GET';
        const body = method === 'GET' ? {} : await readBody(req);
        const id = url.searchParams.get('id') ?? url.searchParams.get('displayId');

        if (route === 'me' && method === 'GET') return send(res, 200, USER);
        if (route === 'me' && method === 'DELETE') return send(res, 200, { ok: true });
        if (route === 'refresh-token') return send(res, 200, { access_token: 'fixture-token', expires_in: 86400 });

        if (route === 'displays' && method === 'GET') return send(res, 200, displays);
        if (route === 'displays' && method === 'POST') {
          const row: FixtureDisplay = {
            id: randomUUID(),
            display_id: randomUUID(),
            name: String(body.name ?? 'New display'),
            passcode_enabled: false,
            is_owner: true,
            owner_plan: 'free',
            config: null,
          };
          displays = [...displays, row];
          return send(res, 200, row);
        }
        if (route === 'displays' && method === 'PATCH') {
          displays = displays.map((d) =>
            d.id !== id
              ? d
              : {
                  ...d,
                  ...(typeof body.name === 'string' ? { name: body.name } : {}),
                  ...('passcode' in body ? { passcode_enabled: body.passcode !== null } : {}),
                },
          );
          return send(res, 200, { ok: true });
        }
        if (route === 'config' && method === 'PUT') {
          displays = displays.map((d) => (d.id === id ? { ...d, config: body } : d));
          return send(res, 200, { ok: true });
        }
        if (route === 'display' && method === 'GET') {
          const row = displays.find((d) => d.display_id === id);
          return row ? send(res, 200, { config: row.config }) : send(res, 404, { error: 'Not found' });
        }
        if (route === 'invites' && method === 'GET') {
          return send(res, 200, { invites, collaborators });
        }
        if (route === 'invites' && method === 'POST') {
          const invite = { id: randomUUID(), invited_email: body.email, created_at: new Date().toISOString() };
          invites.push(invite);
          return send(res, 200, invite);
        }
        if (route === 'invites' && method === 'DELETE') {
          // Revoke a pending invite (?email=) or remove a collaborator (?collaboratorId=), so the
          // Invite dialog's list and its Undo behave as they do in production.
          const email = url.searchParams.get('email');
          const collaboratorId = url.searchParams.get('collaboratorId');
          if (email) {
            const index = invites.findIndex((invite) => invite.invited_email === email);
            if (index !== -1) invites.splice(index, 1);
          }
          if (collaboratorId) {
            const index = collaborators.findIndex((collaborator) => collaborator.id === collaboratorId);
            if (index !== -1) collaborators.splice(index, 1);
          }
          return send(res, 200, { ok: true });
        }
        if (route === 'pair' && method === 'POST') return send(res, 200, { code: 'K7Q2MX', expiresAt: new Date(Date.now() + 6e5).toISOString() });
        if (route === 'pair' && method === 'GET') return send(res, 200, { status: 'pending' });
        if (route === 'claim-display') {
          return send(res, 400, { error: 'That code has expired. Ask the tablet for a new one.' });
        }
        if (route === 'billing/checkout' || route === 'billing/portal') {
          return send(res, 503, { error: 'Billing is not available in fixture mode.' });
        }
        if (route === 'notes' || route === 'todos') return send(res, 200, { ok: true });
        if (route.startsWith('display-calendar')) return send(res, 200, { events: [], calendars: [] });

        return send(res, 404, { error: `No fixture for ${method} /api/${route}` });
      });
    },
  };
}
