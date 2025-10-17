"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

type DropdownItem = {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
};

interface SimpleDaisyDropdownProps {
  items: DropdownItem[];
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  direction?: 'start' | 'end' | 'top' | 'bottom';
  className?: string;
}

/**
 * Version simplifiée du menu déroulant DaisyUI pour une utilisation basique
 */
export default function SimpleDaisyDropdown({ 
  items,
  buttonLabel = "Options",
  buttonIcon,
  size = "sm",
  direction = "end",
  className = "",
}: SimpleDaisyDropdownProps) {
  const router = useRouter();

  // Utilise directement DaisyUI dropdown sans état React
  return (
    <div className={`dropdown dropdown-${direction} ${className}`}>
      <label tabIndex={0} className={`btn btn-${size} ${buttonIcon ? 'btn-circle btn-ghost' : ''}`}>
        {buttonIcon || buttonLabel}
      </label>
      <ul tabIndex={0} className="dropdown-content menu z-[100] p-2 shadow-lg bg-base-100 rounded-box w-52">
        {items.map((item, index) => (
          <li key={index}>
            <a 
              onClick={(e) => {
                e.preventDefault();
                if (item.href) {
                  router.push(item.href as any);
                } else if (item.onClick) {
                  item.onClick();
                }
              }}
              className="flex items-center gap-2"
            >
              {item.icon}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}