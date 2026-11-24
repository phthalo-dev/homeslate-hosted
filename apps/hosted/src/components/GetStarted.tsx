import { useState } from 'react';
import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react';
import { Button, IconButton, ProgressBar } from '@var-ui/react';
import { Hint } from './Hint';
import { getStarted as s } from './GetStarted.styles';

const DISMISSED_KEY = 'homeslate-get-started-dismissed';
const TABLET_KEY = 'homeslate-get-started-tablet';

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/** Record that a display link/QR was opened or a tablet was paired (step 3). */
export function markTabletStepDone() {
  try {
    localStorage.setItem(TABLET_KEY, '1');
  } catch {
    // Private mode: the step simply stays open.
  }
}

export interface GetStartedStep {
  id: string;
  title: string;
  description: string;
  done: boolean;
  action?: { label: string; onPress: () => void };
}

/**
 * First-run checklist, driven by real account state. Hidden once every step is done or after
 * "Hide", so set-up accounts never see it again.
 */
export function GetStarted({ steps }: { steps: GetStartedStep[] }) {
  const [dismissed, setDismissed] = useState(() => readFlag(DISMISSED_KEY));
  // Phones show one progress row; the steps open on demand so the first card stays in view.
  const [expanded, setExpanded] = useState(false);
  const tabletDone = readFlag(TABLET_KEY);
  const resolved = steps.map((step) => (step.id === 'tablet' ? { ...step, done: step.done || tabletDone } : step));
  const doneCount = resolved.filter((step) => step.done).length;
  if (dismissed || doneCount === resolved.length) return null;
  const nextId = resolved.find((step) => !step.done)?.id;

  return (
    <section className={s.root} aria-labelledby="get-started-title" data-expanded={expanded || undefined}>
      <div className={s.header}>
        <div className={s.heading}>
          <h2 id="get-started-title" className={s.title}>
            Get started
          </h2>
          <ProgressBar
            aria-label="Setup progress"
            value={doneCount}
            max={resolved.length}
            size="sm"
            className={s.progress}
          />
          <span className={s.count}>
            {doneCount} of {resolved.length} done
          </span>
        </div>
        <Button
          size="sm"
          appearance="ghost"
          className={s.toggle}
          aria-expanded={expanded}
          aria-controls="get-started-steps"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Hide steps' : 'Show steps'}
          <IconChevronDown size={16} aria-hidden className={s.toggleIcon} />
        </Button>
        <Hint label="Hide this checklist">
          <IconButton
            icon={<IconX size={16} />}
            aria-label="Hide the getting started checklist"
            size="sm"
            appearance="ghost"
            onClick={() => {
              setDismissed(true);
              try {
                localStorage.setItem(DISMISSED_KEY, '1');
              } catch {
                // Hidden for this visit only.
              }
            }}
          />
        </Hint>
      </div>
      <ol className={s.steps} id="get-started-steps">
        {resolved.map((step, index) => (
          <li key={step.id} className={s.step} data-done={step.done || undefined} data-next={step.id === nextId || undefined}>
            <span className={s.marker} aria-hidden>
              {step.done ? <IconCheck size={14} stroke={2.5} /> : index + 1}
            </span>
            <div className={s.stepText}>
              <span className={s.stepTitle}>
                {step.title}
                {step.done ? <span className={s.visuallyHidden}> (done)</span> : null}
              </span>
              <span className={s.stepDescription}>{step.description}</span>
            </div>
            {!step.done && step.action ? (
              <Button
                size="sm"
                appearance={step.id === nextId ? 'solid' : 'outline'}
                tone={step.id === nextId ? 'accent' : 'neutral'}
                onClick={step.action.onPress}
                className={s.stepAction}
              >
                {step.action.label}
              </Button>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
