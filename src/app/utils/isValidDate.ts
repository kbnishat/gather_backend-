const toValidDate = (value: unknown): Date | null => {
    if (value instanceof Date)
      return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === "string" || typeof value === "number") {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

export default toValidDate;