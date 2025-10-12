'use client';
import { chakra, useColorMode } from '@chakra-ui/system';
import { ComponentProps } from 'react';
import { Image } from './Image';
import { getPlanColor, PlanTier } from '@/lib/plan-colors';

type AvatarImageProps = Partial<
  ComponentProps<typeof Image> & {
    showBorder?: boolean;
    planTier?: PlanTier;
    stripePriceId?: string | null;
    isSubscriptionActive?: boolean;
  }
>;

export function NextAvatar({
  src,
  showBorder,
  planTier,
  stripePriceId,
  isSubscriptionActive,
  alt = '',
  style,
  ...props
}: AvatarImageProps) {
  const { colorMode } = useColorMode();

  if (!src || src === '') {
    return null;
  }

  const getBorderStyle = () => {
    if (!showBorder) return {};

    if (planTier || stripePriceId) {
      const planColor = planTier 
        ? getPlanColor(planTier, true)
        : getPlanColor(stripePriceId, isSubscriptionActive);

      return {
        border: '3px solid',
        borderColor: planColor.border,
        boxShadow: `0 0 12px ${planColor.border}40`,
      };
    }

    return {
      border: '2px',
      borderColor: colorMode === 'dark' ? 'navy.700' : 'white',
    };
  };

  return (
    <Image
      {...props}
      {...getBorderStyle()}
      alt={alt}
      objectFit={'fill' as any}
      src={src}
      style={{ ...style, borderRadius: '50%' }}
    />
  );
}

export const ChakraNextAvatar = chakra(NextAvatar, {
  shouldForwardProp: (prop) =>
    ['width', 'height', 'src', 'alt', 'layout', 'showBorder', 'planTier', 'stripePriceId', 'isSubscriptionActive'].includes(prop),
});
