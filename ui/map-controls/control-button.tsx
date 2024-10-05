"use client";
import { AnchorHTMLAttributes, DetailedHTMLProps, forwardRef } from "react";



export const ControlButton = forwardRef<HTMLAnchorElement, Omit<DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>,
  "href"
>>(function ControlButton(props, ref) {
  const { children, onClick, onDoubleClick, ...allProps } = props;

  return (
    <a
      {...allProps}
      ref={ref}
      href="#"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick && onClick(e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onDoubleClick && onDoubleClick(e);
      }}
    >
      {children}
    </a>
  )
})

