import { Link } from 'react-router-dom';
import { Accordion, Text } from '@var-ui/react';
import {
  IconArrowDown,
  IconCalendarEvent,
  IconDeviceTablet,
  IconLayoutGrid,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { PrimaryCta, PublicLayout } from './PublicLayout';
import { home as s } from './HomePage.styles';
import { cx } from '../ui/system';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PLAN_ENTITLEMENTS } from '../billing/plans';

/** The current time and date, refreshed on each minute boundary. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const msToNextMinute = 60_000 - (Date.now() % 60_000);
      timer = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, msToNextMinute + 50);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);
  return now;
}

function WallTablet() {
  // The mock's clock tile tells the real time, like the wall display does.
  const now = useNow();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <figure className={s.wall} aria-hidden="true">
      <div className={s.bezel}>
        <div className={s.screen}>
          <div className={s.tileClock}>
            <p className={s.clock}>
              {time.split(':')[0]}
              <span className={s.clockColon}>:</span>
              {time.split(':')[1]}
            </p>
            <p className={s.date}>{date}</p>
          </div>
          <div className={s.tileWeather}>
            <p className={s.temp}>68°</p>
            <p className={s.tileLabel}>Clear · H 72 L 51</p>
          </div>
          <div className={s.tileAgenda}>
            <p className={s.tileTitle}>Today</p>
            <p className={s.event} data-tone="accent">
              <span>4:00</span> Soccer practice
            </p>
            <p className={s.event}>
              <span>6:30</span> Dinner at Nana’s
            </p>
          </div>
          <div className={s.tileTodo}>
            <p className={s.tileTitle}>Tonight</p>
            <p className={s.todo} data-done>
              Pack lunches
            </p>
            <p className={s.todo}>Trash night</p>
          </div>
        </div>
      </div>
      <div className={s.stand} />
    </figure>
  );
}

const FEATURES: Array<{ icon: ComponentType<{ size?: number; stroke?: number }>; title: string; body: string }> = [
  {
    icon: IconLayoutGrid,
    title: 'Widgets you place yourself',
    body: 'Clock, weather, Google Calendar or any iCal feed, photos, news, stocks, to-dos, sports, alarms, and timers. Drag, resize, and save.',
  },
  {
    icon: IconCalendarEvent,
    title: 'Several screens, several views',
    body: 'A kitchen board, a hallway calendar, a desk clock — each display rotates through the views you design.',
  },
  {
    icon: IconDeviceTablet,
    title: 'Tablets that just show the board',
    body: 'Pair a device at /pair and it opens the live display — no keyboard, no account on the tablet.',
  },
  {
    icon: IconUsers,
    title: 'Household sharing',
    body: 'Invite someone to a display so everyone edits the same wall and it stays in sync.',
  },
];

const FREE = PLAN_ENTITLEMENTS.free;
const PRO = PLAN_ENTITLEMENTS.pro;

function countLabel(count: number | null, noun: string) {
  if (count === null) return `Unlimited ${noun}s`;
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

/** Only answers this codebase can back up (settings, pairing, wake lock, sharing, privacy). */
const FAQ: Array<{ id: string; question: string; answer: ReactNode }> = [
  {
    id: 'tablets',
    question: 'Which tablets work?',
    answer:
      'Any tablet with an up-to-date web browser. Open the display’s link or scan its QR code, or open homeslate.dev/pair on the tablet and type the code it shows into Homeslate. There’s no app to install, and you can add it to the home screen to run full screen.',
  },
  {
    id: 'pin',
    question: 'Can I keep a display private?',
    answer:
      'Yes. Set a 4-digit viewer PIN in the display’s settings and the tablet asks for it before showing anything.',
  },
  {
    id: 'awake',
    question: 'Does the screen stay on?',
    answer: 'While a display is showing, Homeslate asks the browser to keep the screen awake.',
  },
  {
    id: 'sharing',
    question: 'Who can change what’s on the wall?',
    answer:
      'You, and anyone you invite with their Google account. Once they sign in they can edit views and settings too.',
  },
  {
    id: 'privacy',
    question: 'What happens to my Google data?',
    answer: (
      <>
        Homeslate asks only for what your widgets need. The{' '}
        <a href="#google-data" className={s.inlineLink}>
          Google access section
        </a>{' '}
        above lists each permission, and the{' '}
        <Link to="/privacy" className={s.inlineLink}>
          Privacy Policy
        </Link>{' '}
        covers how the data is stored.
      </>
    ),
  },
];

const STEPS = [
  { title: 'Sign in', body: 'Use your Google account. Homeslate creates your first display.' },
  { title: 'Arrange', body: 'Add widgets and views from any laptop or phone.' },
  { title: 'Hang it up', body: 'Open the display on a tablet, or pair one with a 6-character code.' },
];

export function HomePage() {
  useDocumentTitle(null);
  return (
    <PublicLayout>
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroCopy}>
          <Text eyebrow size="sm" weight="semibold" className={s.eyebrow}>
            Home dashboards for any tablet
          </Text>
          <h1 id="hero-title" className={s.heroTitle}>
            The slate on the wall.
          </h1>
          <p className={s.lead}>
            Homeslate turns a spare tablet into the family board: clock, weather, calendars, photos,
            to-dos, and alarms, arranged once and left up in the kitchen, hallway, or on a desk.
          </p>
          <div className={s.ctas}>
            <PrimaryCta size="lg" />
            <a href="#how-it-works" className={s.textLink}>
              How it works
              <IconArrowDown size={18} aria-hidden />
            </a>
          </div>
          <Text size="sm" tone="secondary" className={s.heroNote}>
            Free for one display. No app to install on the tablet.
          </Text>
        </div>
        <WallTablet />
      </section>

      <section className={s.section} aria-labelledby="what-it-does">
        <h2 id="what-it-does" className={s.sectionTitle}>
          What it does
        </h2>
        <ul className={s.features}>
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title} className={s.feature}>
              <span className={s.featureIcon}>
                <Icon size={20} stroke={1.6} />
              </span>
              <h3 className={s.featureTitle}>{title}</h3>
              <p className={s.featureBody}>{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="how-it-works" className={s.section} aria-labelledby="how-title">
        <h2 id="how-title" className={s.sectionTitle}>
          How it works
        </h2>
        <ol className={s.steps}>
          {STEPS.map((step, index) => (
            <li key={step.title} className={s.step}>
              <span className={s.stepNumber} aria-hidden>
                {index + 1}
              </span>
              <h3 className={s.featureTitle}>{step.title}</h3>
              <p className={s.featureBody}>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={cx(s.section, s.scopeSection)} aria-labelledby="google-data">
        <div className={s.scopeIntro}>
          <h2 id="google-data" className={s.sectionTitle}>
            Why Homeslate asks for Google access
          </h2>
          <p className={s.sectionLead}>
            Signing in with Google is how you create a Homeslate account and connect the widgets that
            read Google data. We request only what those features need:
          </p>
        </div>
        <dl className={s.scopes}>
          <div className={s.scope}>
            <dt>Google account (name, email, profile photo)</dt>
            <dd>
              Identifies you so we can attach the displays you own, invitations you send, and the
              person currently signed in. We do not use your Google account to post, email, or
              contact people for you.
            </dd>
          </div>
          <div className={s.scope}>
            <dt>Google Calendar</dt>
            <dd>
              Reads the calendars you choose so Calendar widgets can show upcoming events on your
              wall displays, and lets you create, edit, or delete events from the display. We store
              a refresh token on our servers so a registered display can keep fetching events after
              you close the browser you signed in on. We do not sell calendar data or use it for
              advertising.
            </dd>
          </div>
          <div className={s.scope}>
            <dt>Google Photos Picker</dt>
            <dd>
              Opens Google&apos;s photo picker so you can choose specific photos for a widget or
              background. We copy the photos you pick into Homeslate storage and show them on your
              displays. We cannot browse your full library&nbsp;— only items you select in the picker.
            </dd>
          </div>
        </dl>
        <p className={cx(s.sectionLead, s.scopeNote)}>
          You can disconnect Homeslate from{' '}
          <a href="https://myaccount.google.com/permissions" className={s.inlineLink}>
            Google Account permissions
          </a>
          . How we store this data is in the{' '}
          <Link to="/privacy" className={s.inlineLink}>
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section className={s.section} aria-labelledby="plans-title">
        <h2 id="plans-title" className={s.sectionTitle}>
          Free to start
        </h2>
        <p className={s.sectionLead}>
          Every widget, household sharing and tablet pairing are in both plans. Pro lifts the limits.
        </p>
        <div className={s.plans}>
          <article className={s.plan} aria-labelledby="plan-free">
            <h3 id="plan-free" className={s.planName}>
              Free
            </h3>
            <ul className={s.planList}>
              <li>{countLabel(FREE.maxDisplays, 'display')}</li>
              <li>{countLabel(FREE.maxViewsPerDisplay, 'view')} per display</li>
              <li>Every widget, sharing and pairing</li>
            </ul>
          </article>
          <article className={s.plan} data-featured aria-labelledby="plan-pro">
            <h3 id="plan-pro" className={s.planName}>
              Pro
            </h3>
            <ul className={s.planList}>
              <li>{PRO.maxDisplays === null ? 'Unlimited displays' : countLabel(PRO.maxDisplays, 'display')}</li>
              <li>
                {PRO.maxViewsPerDisplay === null
                  ? 'Unlimited views per display'
                  : `${countLabel(PRO.maxViewsPerDisplay, 'view')} per display`}
              </li>
              <li>Everything in Free</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={s.section} aria-labelledby="faq-title">
        <h2 id="faq-title" className={s.sectionTitle}>
          Questions
        </h2>
        <Accordion type="single" className={s.faq}>
          {FAQ.map((item) => (
            <Accordion.Item key={item.id} id={item.id}>
              <Accordion.Trigger className={s.faqQuestion}>{item.question}</Accordion.Trigger>
              <Accordion.Panel>
                <p className={s.faqAnswer}>{item.answer}</p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>

      <section className={s.closing} aria-labelledby="closing-title">
        <h2 id="closing-title" className={s.closingTitle}>
          Put the family schedule where everyone sees it.
        </h2>
        <PrimaryCta size="lg" />
      </section>
    </PublicLayout>
  );
}
