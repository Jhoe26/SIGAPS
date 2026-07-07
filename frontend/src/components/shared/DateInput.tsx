import * as React from "react";

import { Input, type InputProps } from "@/components/ui/input";

export const DateInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <Input type="date" ref={ref} {...props} />
));
DateInput.displayName = "DateInput";
