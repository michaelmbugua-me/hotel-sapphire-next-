import { Dumbbell, Flower2, Users, Utensils, Waves, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import type { FeaturedFacilityIcon } from '@/types/facility';

// Lucide stand-ins for the Font Awesome glyphs: swimming-pool → Waves, spa → Flower2,
// dumbbell → Dumbbell, utensils → Utensils, users → Users.
const ICONS: Record<FeaturedFacilityIcon, ComponentType<LucideProps>> = {
  pool: Waves,
  spa: Flower2,
  gym: Dumbbell,
  dining: Utensils,
  events: Users,
};

export function FacilityIcon({ name, ...props }: { name: FeaturedFacilityIcon } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon {...props} />;
}
