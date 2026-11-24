import { useState, useMemo } from 'react';
import { Button, Dialog, SearchInput, Stack, Text, UnstyledButton } from '@var-ui/react';
import { dialogAutoFocus } from './dialogFocus';
import * as TablerIcons from '@tabler/icons-react';
import { iconPicker as s } from './IconPickerModal.styles';

// Curated set of icons relevant for view indicators
const CURATED_ICON_NAMES = [
  // Home & rooms
  'IconHome', 'IconHomeFilled', 'IconBed', 'IconSofa', 'IconToolsKitchen', 'IconToolsKitchen2',
  'IconBath', 'IconGarage', 'IconTree', 'IconPlant', 'IconPlant2',
  // Time & calendar
  'IconClock', 'IconCalendar', 'IconCalendarEvent', 'IconAlarm', 'IconSunrise', 'IconSunset',
  'IconMoon', 'IconSun', 'IconStars',
  // Weather
  'IconCloud', 'IconCloudRain', 'IconSnowflake', 'IconThunderstorm', 'IconWind', 'IconTemperature',
  // Food & kitchen
  'IconCoffee', 'IconPizza', 'IconSalad', 'IconGlass', 'IconBottle', 'IconMeat',
  'IconApple', 'IconChefHat',
  // Entertainment
  'IconDeviceTv', 'IconMusic', 'IconMusicNote', 'IconMovie', 'IconGamepad', 'IconHeadphones',
  // Sports & fitness
  'IconBike', 'IconRun', 'IconSwimming', 'IconBall', 'IconYoga',
  // Work & productivity
  'IconBriefcase', 'IconChecklist', 'IconNote', 'IconNotebook', 'IconClipboard',
  'IconMailbox', 'IconMessages', 'IconPhone',
  // Travel & transport
  'IconCar', 'IconBus', 'IconPlane', 'IconMap', 'IconMapPin',
  // People
  'IconUser', 'IconUsers', 'IconHeart', 'IconBabyCarriage', 'IconDog', 'IconCat',
  // Nature
  'IconFlower', 'IconLeaf', 'IconMountain', 'IconWave',
  // Tech
  'IconDeviceLaptop', 'IconDeviceDesktop', 'IconBrandGoogle', 'IconWifi',
  // Misc
  'IconStar', 'IconBell', 'IconFlag', 'IconPinned', 'IconBookmark', 'IconTag',
  'IconLightbulb', 'IconRecycle', 'IconShoppingCart', 'IconGift',
];

type IconComponent = React.ComponentType<{ size?: number; stroke?: number }>;

function getIconComponent(name: string): IconComponent | null {
  const icon = (TablerIcons as Record<string, unknown>)[name];
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
    return icon as IconComponent;
  }
  return null;
}

function iconLabel(name: string): string {
  return name.replace(/^Icon/, '').replace(/([A-Z0-9]+)/g, ' $1').trim();
}

interface IconPickerModalProps {
  opened: boolean;
  onClose: () => void;
  currentIcon?: string;
  onSelect: (iconName: string | undefined) => void;
}

export function IconPickerModal({ opened, onClose, currentIcon, onSelect }: IconPickerModalProps) {
  const [query, setQuery] = useState('');

  const displayedIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURATED_ICON_NAMES;

    // Search across all Tabler icon names
    const all = Object.keys(TablerIcons).filter((k) => k.startsWith('Icon'));
    return all.filter((name) => name.toLowerCase().includes(q)).slice(0, 120);
  }, [query]);

  const handleSelect = (name: string) => {
    onSelect(name);
    onClose();
  };

  const handleClear = () => {
    onSelect(undefined);
    onClose();
  };

  return (
    <Dialog
      open={opened}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Choose a view icon"
      description="Shown in the view switcher on the display."
      size="lg"
    >
      <Stack gap="md">
        <SearchInput
          aria-label="Search icons"
          placeholder="Search 4,000+ icons — try “kitchen” or “sun”"
          value={query}
          onValueChange={setQuery}
          ref={dialogAutoFocus}
        />
        <div className={s.scroller}>
          {displayedIcons.length === 0 ? (
            <Text tone="secondary" size="sm" className={s.empty}>
              No icons match “{query}”.
            </Text>
          ) : (
            <div className={s.grid} role="group" aria-label={query ? 'Search results' : 'Suggested icons'}>
              {displayedIcons.map((name) => {
                const Ic = getIconComponent(name);
                if (!Ic) return null;
                const label = iconLabel(name);
                const isActive = name === currentIcon;
                return (
                  <UnstyledButton
                    key={name}
                    className={s.option}
                    data-active={isActive || undefined}
                    aria-pressed={isActive}
                    aria-label={label}
                    title={label}
                    onClick={() => handleSelect(name)}
                  >
                    <Ic size={22} stroke={1.5} />
                  </UnstyledButton>
                );
              })}
            </div>
          )}
        </div>
        <Dialog.Actions>
          <Button type="button" tone="danger" appearance="ghost" onClick={handleClear} disabled={!currentIcon}>
            Remove icon
          </Button>
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </Dialog.Actions>
      </Stack>
    </Dialog>
  );
}
