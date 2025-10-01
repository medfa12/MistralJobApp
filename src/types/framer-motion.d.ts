declare module 'framer-motion' {
  import * as React from 'react';

  export interface Variants {
    [key: string]: any;
  }

  export interface Transition {
    type?: string;
    duration?: number;
    delay?: number;
    ease?: string | number[];
    repeat?: number;
    repeatType?: 'loop' | 'reverse' | 'mirror';
    repeatDelay?: number;
    stiffness?: number;
    damping?: number;
    mass?: number;
    velocity?: number;
    restDelta?: number;
    restSpeed?: number;
  }

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    variants?: Variants;
    transition?: Transition;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileDrag?: any;
    drag?: boolean | 'x' | 'y';
    dragConstraints?: any;
    dragElastic?: boolean | number;
    dragMomentum?: boolean;
    onDragStart?: (event: any, info: any) => void;
    onDragEnd?: (event: any, info: any) => void;
    onDrag?: (event: any, info: any) => void;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export type MotionComponent<T = any> = React.ForwardRefExoticComponent<
    T & MotionProps & React.RefAttributes<any>
  >;

  export const motion: {
    div: MotionComponent<React.HTMLAttributes<HTMLDivElement>>;
    span: MotionComponent<React.HTMLAttributes<HTMLSpanElement>>;
    p: MotionComponent<React.HTMLAttributes<HTMLParagraphElement>>;
    button: MotionComponent<React.ButtonHTMLAttributes<HTMLButtonElement>>;
    a: MotionComponent<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
    img: MotionComponent<React.ImgHTMLAttributes<HTMLImageElement>>;
    input: MotionComponent<React.InputHTMLAttributes<HTMLInputElement>>;
    textarea: MotionComponent<React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
    select: MotionComponent<React.SelectHTMLAttributes<HTMLSelectElement>>;
    form: MotionComponent<React.FormHTMLAttributes<HTMLFormElement>>;
    ul: MotionComponent<React.HTMLAttributes<HTMLUListElement>>;
    ol: MotionComponent<React.HTMLAttributes<HTMLOListElement>>;
    li: MotionComponent<React.LiHTMLAttributes<HTMLLIElement>>;
    h1: MotionComponent<React.HTMLAttributes<HTMLHeadingElement>>;
    h2: MotionComponent<React.HTMLAttributes<HTMLHeadingElement>>;
    h3: MotionComponent<React.HTMLAttributes<HTMLHeadingElement>>;
    h4: MotionComponent<React.HTMLAttributes<HTMLHeadingElement>>;
    h5: MotionComponent<React.HTMLAttributes<HTMLHeadingElement>>;
    h6: MotionComponent<React.HTMLAttributes<HTMLHeadingElement>>;
    section: MotionComponent<React.HTMLAttributes<HTMLElement>>;
    article: MotionComponent<React.HTMLAttributes<HTMLElement>>;
    header: MotionComponent<React.HTMLAttributes<HTMLElement>>;
    footer: MotionComponent<React.HTMLAttributes<HTMLElement>>;
    nav: MotionComponent<React.HTMLAttributes<HTMLElement>>;
    main: MotionComponent<React.HTMLAttributes<HTMLElement>>;
    aside: MotionComponent<React.HTMLAttributes<HTMLElement>>;
    svg: MotionComponent<React.SVGAttributes<SVGSVGElement>>;
    path: MotionComponent<React.SVGAttributes<SVGPathElement>>;
    circle: MotionComponent<React.SVGAttributes<SVGCircleElement>>;
    rect: MotionComponent<React.SVGAttributes<SVGRectElement>>;
    line: MotionComponent<React.SVGAttributes<SVGLineElement>>;
    polyline: MotionComponent<React.SVGAttributes<SVGPolylineElement>>;
    polygon: MotionComponent<React.SVGAttributes<SVGPolygonElement>>;
    <T extends keyof JSX.IntrinsicElements>(
      component: T
    ): MotionComponent<JSX.IntrinsicElements[T]>;
    <T extends React.ComponentType<any>>(
      component: T
    ): MotionComponent<React.ComponentProps<T>>;
  };

  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    initial?: boolean;
    custom?: any;
    exitBeforeEnter?: boolean;
    mode?: 'sync' | 'wait' | 'popLayout';
    onExitComplete?: () => void;
  }

  export const AnimatePresence: React.FC<AnimatePresenceProps>;

  export function useAnimation(): any;
  export function useMotionValue(initial: any): any;
  export function useTransform(value: any, from: any[], to: any[]): any;
  export function useSpring(value: any, config?: any): any;
  export function useScroll(options?: any): any;
  export function useVelocity(value: any): any;
  export function useAnimationControls(): any;
}

