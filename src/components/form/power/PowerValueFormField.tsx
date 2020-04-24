import { Box, FormField, FormFieldProps, TextInput } from "grommet";
import React, { useState, useEffect } from "react";
import { Power, Weight } from "../../../types";
import { round } from "../../../util";

interface OwnProps {
  weight?: Weight;
  power?: Power;
  valueLabel?: string;
  setPower: (power: Power) => void;
}

type Props = OwnProps & FormFieldProps & Omit<JSX.IntrinsicElements["input"], "placeholder">;

const PowerValueFormField = ({ weight, power, setPower, ref, valueLabel = "Power (Pt)", ...rest }: Props) => {
  const [value, setValue] = useState(power?.value);
  useEffect(() => {
    setValue(power?.value);
  }, [power]);
  return (
    <Box fill>
      <FormField label={valueLabel} required {...rest}>
        <TextInput
          onChange={(e) => {
            setValue(parseFloat(e.target.value));
          }}
          onBlur={() => setPower({ ...power, value })}
          value={value ? round(value, 2) : ""}
          type="number"
          step="any"
        />
      </FormField>
    </Box>
  );
};

export default PowerValueFormField;
