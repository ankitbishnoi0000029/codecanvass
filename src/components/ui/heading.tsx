import React from 'react';
import type { HeadingProps } from '@/utils/types/uiTypes';


export function Heading({
    title,
    description,
    as = 'h1',
    align = 'center',
    className = '',
    titleClassName = '',
    descriptionClassName = ''
}: HeadingProps) {
    const TitleTag = as;
    const alignment = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

    return (
        <div className={`${alignment} max-w-4xl px-4 ${className}`}>
            <TitleTag className={`text-xl sm:text-5xl md:text-6xl lg:text-4xl font-bold text-black mb-6 leading-tight ${titleClassName}`}>
                {title}
            </TitleTag>
            {description && (
                <p className={`text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto mb-8 ${descriptionClassName}`}>
                    {description}
                </p>
            )}
        </div>
    );
}

