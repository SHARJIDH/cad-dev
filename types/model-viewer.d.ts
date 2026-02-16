import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': ModelViewerJSX & DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

interface ModelViewerJSX {
    ref?: React.Ref<HTMLElement>;
    src?: string;
    poster?: string;
    alt?: string;
    ar?: boolean;
    'ar-modes'?: string;
    'ar-scale'?: string;
    'camera-controls'?: boolean;
    'auto-rotate'?: boolean;
    'shadow-intensity'?: string;
    'environment-image'?: string;
    'exposure'?: string;
    'camera-orbit'?: string;
    'min-camera-orbit'?: string;
    'max-camera-orbit'?: string;
    'camera-target'?: string;
    'field-of-view'?: string;
    loading?: 'auto' | 'lazy' | 'eager';
}

export {};
