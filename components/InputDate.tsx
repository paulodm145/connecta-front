// InputDate.tsx
"use client";

import React from "react";
import InputMask from "react-input-mask";

export const MaskedInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onChange, ...props }, ref) => (
    <InputMask
      {...props}
      inputRef={ref}
      value={value}
      onChange={onChange}
    />
  )
);