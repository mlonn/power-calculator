import {
  CALCULATION_ERRORS,
  Distance,
  DistanceUnit,
  Duration,
  DurationUnit,
  Gender,
  Power,
  PowerMeter,
  PowerUnit,
  RwcRating,
  SecondDuration,
  StandardDistance,
  StandardDuration,
  StandardPower,
  StandardWeight,
  TimeDuration,
  Weight,
  WeightUnit,
} from "./types";

export const round = (n: number, places: number) => {
  const factor = Math.pow(10, places);
  return Math.round(n * factor) / factor;
};

export const getPowerError = (power: Power, weight: Weight) => {
  if (!power.value) {
    return;
  }
  const value = power.value;
  if (power.unit === PowerUnit.WATTS_KG && (value < 1 || value > 10)) {
    return "Power (Pt): Expecting  1-10 Watts (check value and/or Unit of Measure)";
  }
  let kgs = 70;
  if (weight.value) {
    kgs = toKg(weight).value!;
    if (value < Math.floor(kgs) || value > Math.ceil(kgs * 10)) {
      return `Power (Pt): Expecting ${Math.floor(kgs)}-${Math.ceil(
        kgs * 10
      )} Watts (check value and/or Unit of Measure)`;
    }
  }
};

export const getRwcError = (rating: RwcRating, gender?: Gender, powerMeter?: PowerMeter) => {
  const prefix = rating === RwcRating.TOO_HIGH || rating === RwcRating.TOO_LOW ? "WARNING" : "NOTE";
  if (gender && powerMeter) {
    return `${prefix}: Your RWC (W') is '${rating}' for a ${gender} using ${powerMeter}`;
  } else {
    const enter = !gender && !powerMeter ? "Gender+Power Meter" : !gender ? "Gender" : !powerMeter ? "PowerMeter" : "";
    return `${prefix}: Your RWC (W') is rated '${rating}' - to check this rating, please enter ${enter}`;
  }
};

export const getFtpError = (rating: RwcRating) => {
  const prefix = rating === RwcRating.TOO_HIGH ? "under" : RwcRating.TOO_LOW ? "over" : "";
  if (rating === RwcRating.TOO_HIGH || rating === RwcRating.TOO_LOW) {
    return `WARNING: If your RWC (W') is '${rating}', FTP/CP may be ${prefix}-estimated`;
  } else {
    return null;
  }
};
export const toKg = (weight: Weight) => {
  if (!weight.value) {
    return { ...weight, unit: WeightUnit.KG };
  }
  if (weight.unit === WeightUnit.KG) {
    return weight;
  }
  if (weight.unit === WeightUnit.LBS) {
    return { ...weight, unit: WeightUnit.KG, value: weight.value / 2.205 };
  }
  throw Error("No Stryd Weight unit found");
};
export const toLbs = (weight: Weight) => {
  if (!weight.value) {
    return { ...weight, unit: WeightUnit.LBS };
  }
  if (weight.unit === WeightUnit.LBS) {
    return weight;
  }
  if (weight.unit === WeightUnit.KG) {
    return { ...weight, unit: WeightUnit.LBS, value: weight.value * 2.205 };
  }
  throw Error("No Stryd Weight unit found");
};

export const toWkg = (power: Power, weight: Weight) => {
  if (!power.value) {
    throw Error(CALCULATION_ERRORS.NO_POWER);
  }
  if (!power.unit) {
    throw Error(CALCULATION_ERRORS.NO_POWER_UNIT);
  }

  if (power.unit === PowerUnit.WATTS) {
    if (!weight || !weight.value) {
      throw Error(CALCULATION_ERRORS.NO_WEIGHT);
    }
    let weightValue = weight.value;
    if (weight.unit === WeightUnit.LBS) {
      weightValue = toStandardWeight(weight).value;
    }
    return {
      value: power.value / weightValue,
      unit: PowerUnit.WATTS_KG,
    };
  }
  return power;
};

export const toW = (power: Power, weight: Weight) => {
  if (!power.value) {
    throw Error(CALCULATION_ERRORS.NO_POWER);
  }
  if (!power.unit) {
    throw Error(CALCULATION_ERRORS.NO_POWER_UNIT);
  }

  if (power.unit === PowerUnit.WATTS_KG) {
    if (!weight || !weight.value) {
      throw Error(CALCULATION_ERRORS.NO_WEIGHT);
    }
    let weightValue = weight.value;
    if (weight.unit === WeightUnit.LBS) {
      weightValue = toStandardWeight(weight).value;
    }
    return {
      value: power.value * weightValue,
      unit: PowerUnit.WATTS,
    };
  }
  return power;
};

export const toStandardDistance = (distance: Distance): StandardDistance => {
  if (!distance.unit) {
    throw Error(CALCULATION_ERRORS.NO_DISTANCE_UNIT);
  }
  if (
    distance.unit === DistanceUnit.METERS ||
    distance.unit === DistanceUnit.MILES ||
    distance.unit === DistanceUnit.KM ||
    distance.unit === DistanceUnit.FEET
  ) {
    if (!distance.value) {
      throw Error(CALCULATION_ERRORS.NO_DISTANCE);
    }
    switch (distance.unit) {
      case DistanceUnit.FEET:
        return { value: distance.value / 3.28084, unit: DistanceUnit.METERS };
      case DistanceUnit.MILES:
        return { value: distance.value * 1609.34, unit: DistanceUnit.METERS };
      case DistanceUnit.METERS:
        return { value: distance.value, unit: DistanceUnit.METERS };
      case DistanceUnit.KM:
        return { value: distance.value * 1000, unit: DistanceUnit.METERS };
      default:
        throw Error(CALCULATION_ERRORS.NO_DISTANCE);
    }
  } else {
    switch (distance.unit) {
      case DistanceUnit.MARATHON:
        return { value: 42195, unit: DistanceUnit.METERS };
      case DistanceUnit.HALF_MARATHON:
        return { value: 21098, unit: DistanceUnit.METERS };
      case DistanceUnit.FIVE_K:
        return { value: 5000, unit: DistanceUnit.METERS };
      case DistanceUnit.TEN_K:
        return { value: 10000, unit: DistanceUnit.METERS };
      default:
        throw Error(CALCULATION_ERRORS.NO_DISTANCE);
    }
  }
};

export const toStandardPower = (power: Power, weight?: Weight): StandardPower => {
  if (!power.value) {
    throw Error(CALCULATION_ERRORS.NO_POWER);
  }
  if (!power.unit) {
    throw Error(CALCULATION_ERRORS.NO_POWER_UNIT);
  }
  let stdPower: StandardPower;
  stdPower = { value: power.value, unit: PowerUnit.WATTS };
  if (power.unit === PowerUnit.WATTS_KG) {
    if (!weight || !weight.value) {
      throw Error(CALCULATION_ERRORS.NO_WEIGHT);
    }
    let weightValue = weight.value;
    if (weight.unit === WeightUnit.LBS) {
      weightValue = toStandardWeight(weight).value;
    }
    stdPower = {
      value: power.value * weightValue,
      unit: PowerUnit.WATTS,
    };
  }
  return stdPower;
};

export const toStandardDuration = (duration: Duration): StandardDuration => {
  if (!duration.unit) {
    throw Error(CALCULATION_ERRORS.NO_DURATION_UNIT);
  }
  if (duration.unit === DurationUnit.SECONDS) {
    if (!duration.value) {
      throw Error(CALCULATION_ERRORS.NO_DURATION);
    }
    return { value: duration.value, unit: DurationUnit.SECONDS };
  }
  if (duration.unit === DurationUnit.HH_MM_SS) {
    if (duration.unit === DurationUnit.HH_MM_SS && !duration.hours && !duration.minutes && !duration.seconds) {
      throw Error(CALCULATION_ERRORS.NO_DURATION);
    }
    duration = timeToSeconds(duration);
    return { value: duration.value!, unit: DurationUnit.SECONDS };
  }
  throw Error(`${CALCULATION_ERRORS.NO_DURATION} or ${CALCULATION_ERRORS.NO_DURATION_UNIT}`);
};

export const toStandardWeight = (weight: Weight): StandardWeight => {
  if (!weight.unit) {
    throw Error(CALCULATION_ERRORS.NO_WEIGHT);
  }
  if (!weight.value) {
    throw Error(CALCULATION_ERRORS.NO_WEIGHT);
  }
  if (weight.unit === WeightUnit.LBS) {
    const kgWeight = toKg(weight);
    return { value: kgWeight.value!, unit: WeightUnit.KG };
  }
  if (weight.unit === WeightUnit.KG) {
    return { value: weight.value, unit: WeightUnit.KG };
  }
  throw Error(CALCULATION_ERRORS.NO_WEIGHT);
};
export const durationToString = (duration: Duration) => {
  try {
    const timeDuration = duration.unit === DurationUnit.HH_MM_SS ? duration : secondsToTime(duration);
    if (isNaN(timeDuration.hours!) && isNaN(timeDuration.minutes!) && isNaN(timeDuration.seconds!)) {
      return "";
    }
    let hoursString = "00";
    let minuteString = "00";
    let secondString = "00";
    if (timeDuration.hours) {
      hoursString = timeDuration.hours > 9 ? `${timeDuration.hours}` : `0${timeDuration.hours}`;
    }
    if (timeDuration.minutes) {
      minuteString = timeDuration.minutes > 9 ? `${timeDuration.minutes}` : `0${timeDuration.minutes}`;
    }
    if (timeDuration.seconds) {
      secondString = timeDuration.seconds > 9 ? `${timeDuration.seconds}` : `0${timeDuration.seconds}`;
    }
    return `${hoursString}:${minuteString}:${secondString}`;
  } catch (error) {
    return "";
  }
};

export const timeToSeconds = (duration: Duration): SecondDuration => {
  if (duration.unit === DurationUnit.SECONDS) {
    return duration;
  } else if (duration.unit === DurationUnit.HH_MM_SS) {
    if (duration.hours === undefined && duration.minutes === undefined && duration.seconds === undefined) {
      return { unit: DurationUnit.SECONDS };
    }
    const hours = duration.hours ? duration.hours * 60 * 60 : 0;
    const minutes = duration.minutes ? duration.minutes * 60 : 0;
    const seconds = duration.seconds ? duration.seconds : 0;
    return { unit: DurationUnit.SECONDS, value: hours + minutes + seconds };
  } else {
    throw Error(CALCULATION_ERRORS.NO_DURATION_UNIT);
  }
};

export const secondsToTime = (duration: Duration): TimeDuration => {
  if (duration.unit === DurationUnit.HH_MM_SS) {
    return duration;
  } else if (duration.unit === DurationUnit.SECONDS) {
    let totalSeconds = duration.value;
    if (totalSeconds) {
      const hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return { unit: DurationUnit.HH_MM_SS, hours, seconds, minutes };
    } else {
      return { unit: DurationUnit.HH_MM_SS };
    }
  } else {
    throw Error("No unit");
  }
};
